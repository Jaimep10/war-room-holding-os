"use client";

import { useRef, useState } from "react";
import { AgentResponse, AgentSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, MessageSquare, Users, User, FileUp, FileText, X, Loader2 } from "lucide-react";

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
}: {
  agents: AgentSummary[];
  apiKeyConfigured: boolean;
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

  function toggleMulti(slug: string) {
    setMultiSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
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

        const finalMessage = pdfAttachment
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
