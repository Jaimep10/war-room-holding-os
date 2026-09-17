"use client";

import { useEffect, useRef, useState } from "react";
import { AgentResponse, AgentSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, MessageSquare, Users, User, FileUp, FileText, X, Loader2, Brain, Plus } from "lucide-react";
import {
  ProjectMemory,
  TipoNegocio,
  loadProjectMemory,
  setTipoNegocio,
  setDescripcion as saveDescripcionMemoria,
  addArchivoSubido,
  addContextoClave,
  removeContextoClave,
  addDecision,
  buildMemoriaContextBlock,
} from "@/lib/projectMemory";

type Mode = "single" | "multi" | "team";

const AGENTE_ANALISTA_SLUG = "agente-analista";

interface PdfAttachment {
  title: string;
  text: string;
  truncated: boolean;
  originalChars: number;
  paginas: number | null;
}

export default function ChatPanel({
  agents,
  apiKeyConfigured,
  projectId,
  projectLabel,
}: {
  agents: AgentSummary[];
  apiKeyConfigured: boolean;
  projectId: string | null;
  projectLabel?: string | null;
}) {
  const [mode, setMode] = useState<Mode>("single");
  const [singleAgent, setSingleAgent] = useState(agents[0]?.slug ?? "");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AgentResponse[]>([]);
  const [ideaLabel, setIdeaLabel] = useState<string | null>(null);

  const [pdfAttachment, setPdfAttachment] = useState<PdfAttachment | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memory, setMemory] = useState<ProjectMemory | null>(null);
  const [contextoInput, setContextoInput] = useState("");

  // Aislamiento estricto (Principio #2, Parte B): cada vez que cambia el proyecto activo,
  // se recarga SU memoria propia y se limpia todo el estado efímero del chat — nada de un
  // proyecto puede colarse en el siguiente, aunque sea la misma pestaña/conversación.
  useEffect(() => {
    setMemory(projectId ? loadProjectMemory(projectId) : null);
    setMessage("");
    setResults([]);
    setIdeaLabel(null);
    setPdfAttachment(null);
    setPdfError(null);
    setContextoInput("");
  }, [projectId]);

  function toggleMulti(slug: string) {
    setMultiSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function handleSetTipo(tipo: TipoNegocio) {
    if (!projectId) return;
    setTipoNegocio(projectId, tipo);
    const updated = addDecision(projectId, "dashboard", `Tipo de negocio definido por el usuario: ${tipo}.`);
    setMemory(updated);
  }

  function addContexto() {
    if (!projectId || !contextoInput.trim()) return;
    setMemory(addContextoClave(projectId, contextoInput.trim()));
    setContextoInput("");
  }

  async function onPdfSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a subir el mismo archivo si lo quita y lo vuelve a poner
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Solo se aceptan archivos PDF.");
      return;
    }

    setUploadingPdf(true);
    setPdfError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) {
        setPdfError(data.error);
        setPdfAttachment(null);
      } else {
        setPdfAttachment({
          title: data.title,
          text: data.text,
          truncated: !!data.truncated,
          originalChars: data.originalChars ?? data.text.length,
          paginas: data.paginas ?? null,
        });
        if (projectId) {
          setMemory(
            addArchivoSubido(projectId, {
              titulo: data.title,
              chars: data.originalChars ?? data.text.length,
              agregadoEn: new Date().toISOString(),
            })
          );
        }
      }
    } catch (err: any) {
      setPdfError(String(err?.message || err));
    } finally {
      setUploadingPdf(false);
    }
  }

  function clearPdf() {
    setPdfAttachment(null);
    setPdfError(null);
  }

  async function send() {
    setLoading(true);
    setResults([]);
    try {
      if (mode === "team") {
        const res = await fetch("/api/team-meeting", { method: "POST" });
        const data = await res.json();
        if (data.error) {
          setResults([{ agent: "sistema", ok: false, text: data.error }]);
        } else {
          setResults(data.results);
          setIdeaLabel(data.idea ? `${data.idea.title} (${data.idea.giro})` : null);
        }
      } else {
        // Si hay un PDF adjunto, el pase va SIEMPRE a agente-analista (sin importar qué
        // agente esté seleccionado en el modo actual) — es el que recibe el contexto del
        // documento, según el flujo de "Subir PDF".
        const agentSlugs = pdfAttachment ? [AGENTE_ANALISTA_SLUG] : mode === "single" ? [singleAgent] : multiSelected;
        if (!agentSlugs.length) {
          setLoading(false);
          return;
        }

        const targetsAnalista = agentSlugs.includes(AGENTE_ANALISTA_SLUG);

        // Motor de Contexto / Principio #2: si el pase va a agente-analista y este proyecto
        // todavía no tiene tipoNegocio definido, el agente "debe preguntar primero" — lo
        // resolvemos aquí mismo, bloqueando el envío hasta que se responda arriba en
        // "Memoria del Proyecto", en vez de gastar una llamada real solo para recibir un
        // NEEDS_CONTEXT.
        if (targetsAnalista && projectId && (!memory || !memory.tipoNegocio)) {
          setResults([
            {
              agent: "sistema",
              ok: false,
              text: 'Antes de consultar a agente-analista, define arriba en "Memoria del Proyecto" si este negocio es Producto, Servicio o Híbrido — lo necesita para no adivinar (Principio #2).',
            },
          ]);
          setLoading(false);
          return;
        }

        const baseMessage = pdfAttachment
          ? `## Documento adjunto: "${pdfAttachment.title}.pdf"${
              pdfAttachment.paginas ? ` (${pdfAttachment.paginas} páginas)` : ""
            }\n\n${pdfAttachment.text}${
              pdfAttachment.truncated
                ? `\n\n_(Texto truncado por longitud — el PDF original tiene ${pdfAttachment.originalChars} caracteres, se enviaron los primeros ${pdfAttachment.text.length}.)_`
                : ""
            }\n\n---\n\n### Instrucción específica sobre este documento\n\n${
              message || "Analiza el documento adjunto y dame tu dictamen, citando el título del archivo."
            }`
          : message || undefined;

        const memoriaBlock = targetsAnalista && memory ? buildMemoriaContextBlock(memory) : "";
        const finalMessage = memoriaBlock
          ? `${memoriaBlock}\n\n---\n\n${
              typeof baseMessage === "string"
                ? baseMessage
                : "Da tu dictamen sobre la idea activa, siguiendo tu formato de respuesta, tomando en cuenta la memoria del proyecto de arriba."
            }`
          : baseMessage;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentSlugs, message: finalMessage }),
        });
        const data = await res.json();
        if (data.error) {
          setResults([{ agent: "sistema", ok: false, text: data.error }]);
        } else {
          setResults(data.results);
          setIdeaLabel(data.idea ? `${data.idea.title} (${data.idea.giro})` : null);

          if (projectId) {
            const analistaResults: AgentResponse[] = (data.results || []).filter(
              (r: AgentResponse) => r.ok && r.agent === AGENTE_ANALISTA_SLUG
            );
            let updated = memory;
            for (const r of analistaResults) {
              updated = addDecision(projectId, r.agent, r.text);
            }
            if (updated) setMemory(updated);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {!apiKeyConfigured && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-600/30 bg-yellow-500/10 text-yellow-300 text-[11px] px-3 py-2 mb-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            No hay <code>ANTHROPIC_API_KEY</code> configurada — los agentes van a devolver un aviso en vez de una
            respuesta real. Cópiala en <code>dashboard/.env.local</code>.
          </span>
        </div>
      )}

      {projectId && memory && (
        <div className="rounded-lg border border-base-700 bg-base-850 p-2.5 mb-3">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 min-w-0">
              <Brain size={13} className="text-accent-400 shrink-0" />
              <span className="truncate">Memoria del Proyecto{projectLabel ? ` · ${projectLabel}` : ""}</span>
            </div>
            {memory.tipoNegocio && (
              <Badge className="bg-accent-500/20 text-accent-400 uppercase shrink-0">{memory.tipoNegocio}</Badge>
            )}
          </div>

          {!memory.tipoNegocio && (
            <div className="rounded-md border border-yellow-600/30 bg-yellow-500/10 p-2 mb-2">
              <div className="text-[11px] text-yellow-300 mb-1.5">
                ¿Qué tipo de negocio es este proyecto? agente-analista lo necesita antes de opinar (Principio #2 —
                nunca se asume).
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => handleSetTipo("producto")}>
                  Producto
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSetTipo("servicio")}>
                  Servicio
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSetTipo("hibrido")}>
                  Híbrido
                </Button>
              </div>
            </div>
          )}

          <Textarea
            value={memory.descripcion}
            onChange={(e) => setMemory((prev) => (prev ? { ...prev, descripcion: e.target.value } : prev))}
            onBlur={(e) => {
              if (projectId) setMemory(saveDescripcionMemoria(projectId, e.target.value));
            }}
            placeholder="Descripción libre del proyecto (opcional) — se guarda y se le manda al analista..."
            rows={2}
            className="text-xs mb-2"
          />

          {memory.contextoClave.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {memory.contextoClave.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-[10px] bg-base-800 border border-base-600 rounded-full px-2 py-0.5 text-gray-300"
                >
                  {c}
                  <button
                    onClick={() => projectId && setMemory(removeContextoClave(projectId, c))}
                    className="text-gray-500 hover:text-red-300"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <input
              value={contextoInput}
              onChange={(e) => setContextoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addContexto();
                }
              }}
              placeholder="Agregar contexto clave (ej: margen objetivo 35%)..."
              className="flex-1 bg-base-900 border border-base-600 rounded-md px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
            />
            <Button size="sm" variant="outline" onClick={addContexto} disabled={!contextoInput.trim()}>
              <Plus size={12} />
            </Button>
          </div>

          {memory.historialDecisiones.length > 0 && (
            <details className="mt-2">
              <summary className="text-[10px] text-gray-500 cursor-pointer">
                Historial de decisiones ({memory.historialDecisiones.length})
              </summary>
              <div className="mt-1 space-y-1 max-h-24 overflow-y-auto pr-1">
                {memory.historialDecisiones
                  .slice()
                  .reverse()
                  .map((d, i) => (
                    <div key={i} className="text-[10px] text-gray-500">
                      <span className="text-gray-400">
                        [{d.fecha.slice(0, 10)}] {d.agente}:
                      </span>{" "}
                      {d.resumen.slice(0, 140)}
                      {d.resumen.length > 140 ? "…" : ""}
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 mb-3">
        <Button size="sm" variant={mode === "single" ? "primary" : "outline"} onClick={() => setMode("single")}>
          <User size={13} /> 1 agente
        </Button>
        <Button size="sm" variant={mode === "multi" ? "primary" : "outline"} onClick={() => setMode("multi")}>
          <Users size={13} /> Varios
        </Button>
        <Button size="sm" variant={mode === "team" ? "primary" : "outline"} onClick={() => setMode("team")}>
          <MessageSquare size={13} /> REUNIÓN TODO EL EQUIPO
        </Button>
      </div>

      {mode === "single" && (
        <select
          value={singleAgent}
          onChange={(e) => setSingleAgent(e.target.value)}
          className="bg-base-800 border border-base-600 text-sm text-gray-100 rounded-lg px-3 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        >
          {agents.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.slug}
            </option>
          ))}
        </select>
      )}

      {mode === "multi" && (
        <div className="grid grid-cols-2 gap-1.5 mb-2 max-h-32 overflow-y-auto border border-base-700 rounded-lg p-2 bg-base-900">
          {agents.map((a) => (
            <label key={a.slug} className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
              <Checkbox checked={multiSelected.includes(a.slug)} onCheckedChange={() => toggleMulti(a.slug)} />
              {a.slug}
            </label>
          ))}
        </div>
      )}

      {mode !== "team" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onPdfSelected}
          />

          <div className="flex items-center gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPdf}
            >
              {uploadingPdf ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} />}
              {uploadingPdf ? "Extrayendo texto..." : "Subir PDF"}
            </Button>
            {pdfAttachment && (
              <span className="text-[10px] text-gray-500">
                Se enviará a <span className="text-accent-400">{AGENTE_ANALISTA_SLUG}</span> con el PDF como contexto
              </span>
            )}
          </div>

          {pdfError && (
            <div className="text-[11px] text-red-300 mb-2 border border-red-600/30 bg-red-500/10 rounded-lg px-2.5 py-1.5">
              {pdfError}
            </div>
          )}

          {pdfAttachment && (
            <div className="flex items-center gap-2 mb-2 rounded-lg border border-accent-500/30 bg-accent-500/10 px-2.5 py-1.5 text-[11px] text-accent-300">
              <FileText size={13} className="shrink-0" />
              <span className="truncate flex-1">
                {pdfAttachment.title}.pdf
                {pdfAttachment.paginas ? ` · ${pdfAttachment.paginas} pág.` : ""}
                {pdfAttachment.truncated ? " · texto truncado" : ""}
              </span>
              <button onClick={clearPdf} className="text-accent-300 hover:text-red-300 shrink-0" title="Quitar PDF">
                <X size={13} />
              </button>
            </div>
          )}

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              pdfAttachment
                ? "Instrucción sobre el documento adjunto (opcional)..."
                : "Pregunta o instrucción para el agente (opcional — si lo dejas vacío, pide su dictamen estándar)..."
            }
            rows={2}
            className="mb-2"
          />
        </>
      )}

      <Button onClick={send} disabled={loading} className="mb-3 self-start">
        {loading ? "Consultando al equipo..." : "Enviar"}
      </Button>

      {ideaLabel && <div className="text-[11px] text-gray-500 mb-2">Sobre: {ideaLabel}</div>}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {results.map((r, i) => (
          <div key={i} className="rounded-lg border border-base-700 bg-base-850 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={r.ok ? "bg-accent-500/20 text-accent-400" : "bg-red-500/20 text-red-400"}>
                {r.agent}
              </Badge>
            </div>
            {r.ok ? (
              <div className="markdown-body text-xs text-gray-300">
                <ReactMarkdown>{r.text}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-xs text-red-300">{r.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
