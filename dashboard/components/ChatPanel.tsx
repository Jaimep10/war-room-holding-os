"use client";

import { useEffect, useRef, useState } from "react";
import { AgentResponse, AgentSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  MessageSquare,
  Users,
  User,
  FileUp,
  FileText,
  FileSpreadsheet,
  Download,
  X,
  Loader2,
  Brain,
  Plus,
  Calculator,
  Flame,
  Wrench,
} from "lucide-react";
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
import { downloadBlob } from "@/lib/utils";

type Mode = "single" | "multi" | "team" | "warroom";

const AGENTE_ANALISTA_SLUG = "agente-analista";

// Fase 3 — Reunión War Room: cadena fija Estrategia -> Marketing -> Finanzas -> Resumen final
// del analista. Etiquetas solo para pintar el hilo en el chat; el orden real vive en
// app/api/war-room/route.ts.
const WARROOM_THREAD_LABELS: Record<string, string> = {
  "director-estrategia": "🎯 Estrategia",
  "agente-marketing": "📣 Marketing",
  "agente-finanzas": "💰 Finanzas",
  "agente-analista": "🧭 Resumen final (Analista)",
};

interface PdfAttachment {
  title: string;
  text: string;
  truncated: boolean;
  originalChars: number;
  paginas: number | null;
}

interface ExcelHoja {
  nombre: string;
  columnas: string[];
  filas: (string | number | null)[][];
  totalFilas: number;
}

interface ExcelAttachment {
  archivo: string;
  hojas: ExcelHoja[];
}

interface UltimoExcel {
  blob: Blob;
  filename: string;
  etiqueta: string;
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
  // Sin preselección: antes esto arrancaba en agents[0]?.slug, y como listarAgentes()
  // ordena alfabético, SIEMPRE quedaba agente-00-consultor-whatsapp por defecto sin que
  // la persona lo eligiera -- eso es justo la sensación de "clon" que se reportó (parecía
  // que un solo agente respondía siempre). Ahora arranca vacío y el select obliga a elegir.
  const [singleAgent, setSingleAgent] = useState("");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AgentResponse[]>([]);
  const [ideaLabel, setIdeaLabel] = useState<string | null>(null);

  const [pdfAttachment, setPdfAttachment] = useState<PdfAttachment | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [excelAttachment, setExcelAttachment] = useState<ExcelAttachment | null>(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [ultimoExcel, setUltimoExcel] = useState<UltimoExcel | null>(null);
  const [finanzasForm, setFinanzasForm] = useState({ precio: "", costo: "", unidadesMes: "", gastosFijos: "", crecimiento: "" });
  const [generandoExcel, setGenerandoExcel] = useState<"cotizacion" | "completo" | null>(null);
  const [finanzasError, setFinanzasError] = useState<string | null>(null);

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
    setExcelAttachment(null);
    setExcelError(null);
    setContextoInput("");
    setUltimoExcel(null);
    setFinanzasError(null);
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

  async function onExcelSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xlsm") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
      setExcelError("Solo se aceptan archivos Excel (.xlsx/.xlsm/.xls) o .csv.");
      return;
    }

    setUploadingExcel(true);
    setExcelError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload-excel", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) {
        setExcelError(data.error);
        setExcelAttachment(null);
      } else {
        setExcelAttachment({ archivo: data.archivo, hojas: data.hojas });
        if (projectId) {
          const totalFilas = (data.hojas as ExcelHoja[]).reduce((acc, h) => acc + h.totalFilas, 0);
          setMemory(
            addArchivoSubido(projectId, {
              titulo: data.archivo,
              chars: totalFilas,
              agregadoEn: new Date().toISOString(),
              tipo: "excel",
            })
          );
        }
      }
    } catch (err: any) {
      setExcelError(String(err?.message || err));
    } finally {
      setUploadingExcel(false);
    }
  }

  function clearExcel() {
    setExcelAttachment(null);
    setExcelError(null);
  }

  async function generarExcelFinanciero(modo: "cotizacion" | "completo") {
    const precio = Number(finanzasForm.precio);
    const costo = Number(finanzasForm.costo);
    const unidadesMes = Number(finanzasForm.unidadesMes);
    const gastosFijos = Number(finanzasForm.gastosFijos) || 0;
    const crecimientoMensualPct = Number(finanzasForm.crecimiento) / 100 || 0;

    if (!Number.isFinite(precio) || !Number.isFinite(costo) || !Number.isFinite(unidadesMes)) {
      setFinanzasError("Completa al menos precio, costo y unidades/mes (numéricos).");
      return;
    }
    if (precio <= costo) {
      setFinanzasError("El precio debe ser mayor al costo.");
      return;
    }

    setGenerandoExcel(modo);
    setFinanzasError(null);
    try {
      const url = modo === "cotizacion" ? "/api/finanzas/excel" : "/api/finanzas/excel-completo";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precio, costo, unidadesMes, gastosFijos, crecimientoMensualPct }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo generar el Excel.");
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : `WarRoom-${modo}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const etiqueta = modo === "cotizacion" ? "Cotización rápida" : "Financiero completo (P&G + Flujo 12m + P.E.)";

      downloadBlob(blob, filename);
      setUltimoExcel({ blob, filename, etiqueta });

      if (projectId) {
        setMemory(
          addDecision(
            projectId,
            "dashboard",
            `Excel generado (${etiqueta}): precio $${precio}, costo $${costo}, ${unidadesMes} uds/mes, gastos fijos $${gastosFijos}.`
          )
        );
      }
    } catch (err: any) {
      setFinanzasError(String(err?.message || err));
    } finally {
      setGenerandoExcel(null);
    }
  }

  function descargarUltimoExcel() {
    if (!ultimoExcel) return;
    downloadBlob(ultimoExcel.blob, ultimoExcel.filename);
  }

  // Bloques de PDF/Excel adjunto listos para inyectar en cualquier llamada (chat normal o
  // Reunión War Room) — extraído para no duplicar esta lógica de Fase 2 en dos lados.
  function buildBloquesAdjuntos(): string[] {
    const bloquesAdjuntos: string[] = [];
    if (pdfAttachment) {
      bloquesAdjuntos.push(
        `DOCUMENTO DEL USUARIO: ${pdfAttachment.title}\nCONTENIDO:\n${pdfAttachment.text}${
          pdfAttachment.truncated
            ? `\n\n_(truncado — el PDF original tiene ${pdfAttachment.originalChars} caracteres, se muestran los primeros ${pdfAttachment.text.length})_`
            : ""
        }\n---\nInstrucción: Usa este documento como fuente principal. No inventes datos que estén aquí.`
      );
    }
    if (excelAttachment) {
      for (const hoja of excelAttachment.hojas) {
        const previewTxt = hoja.filas.map((f) => f.map((v) => (v === null ? "" : v)).join(" | ")).join("\n");
        bloquesAdjuntos.push(
          `DATOS EXCEL: Hoja "${hoja.nombre}" (archivo ${excelAttachment.archivo}) con columnas [${hoja.columnas.join(
            ", "
          )}] y ${hoja.totalFilas} filas. Primeras filas:\n${previewTxt || "(sin filas de datos)"}\n---\nInstrucción: Usa estos datos reales para tus cálculos. No inventes cifras que no estén en la tabla.`
        );
      }
    }
    return bloquesAdjuntos;
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
      } else if (mode === "warroom") {
        // Reunión War Room (Fase 3): Estrategia -> Marketing -> Finanzas -> Resumen final del
        // analista, en cadena real (cada uno ve al anterior), sobre el MISMO proyecto. Misma
        // exigencia de Principio #2 que agente-analista: no se abre sin tipoNegocio definido.
        if (projectId && (!memory || !memory.tipoNegocio)) {
          setResults([
            {
              agent: "sistema",
              ok: false,
              text: 'Antes de lanzar la Reunión War Room, define arriba en "Memoria del Proyecto" si este negocio es Producto, Servicio o Híbrido — el equipo lo necesita para no adivinar (Principio #2).',
            },
          ]);
          setLoading(false);
          return;
        }

        const bloquesAdjuntos = buildBloquesAdjuntos();
        const memoriaBlock = memory ? buildMemoriaContextBlock(memory) : "";
        const contextoExtra = [memoriaBlock, ...bloquesAdjuntos].filter(Boolean).join("\n\n---\n\n");

        const res = await fetch("/api/war-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contextoExtra, instruccion: message || undefined }),
        });
        const data = await res.json();
        if (data.error) {
          setResults([{ agent: "sistema", ok: false, text: data.error }]);
        } else {
          setResults(data.results);
          setIdeaLabel(data.idea ? `${data.idea.title} (${data.idea.giro})` : null);

          if (projectId) {
            let updated = memory;
            for (const r of data.results as AgentResponse[]) {
              if (r.ok) updated = addDecision(projectId, r.agent, r.text);
            }
            if (updated) setMemory(updated);
          }
        }
      } else {
        // Si hay un PDF o Excel adjunto, el pase va SIEMPRE a agente-analista (sin importar
        // qué agente esté seleccionado en el modo actual) — es el que recibe el documento.
        const hayAdjunto = !!pdfAttachment || !!excelAttachment;
        const agentSlugs = hayAdjunto
          ? [AGENTE_ANALISTA_SLUG]
          : mode === "single"
          ? singleAgent
            ? [singleAgent]
            : []
          : multiSelected;

        if (!agentSlugs.length) {
          if (mode === "single" && !hayAdjunto) {
            setResults([
              { agent: "sistema", ok: false, text: "Elegí primero a qué agente le vas a hablar (arriba en el selector) — no hay uno por defecto." },
            ]);
          }
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

        const bloquesAdjuntos = buildBloquesAdjuntos();

        const baseMessage = bloquesAdjuntos.length
          ? `${bloquesAdjuntos.join("\n\n---\n\n")}\n\n---\n\n### Instrucción del usuario\n\n${
              message || "Analiza el/los documento(s) adjunto(s) y dame tu dictamen, citando la fuente."
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

          <details className="mt-2">
            <summary className="text-[10px] text-gray-500 cursor-pointer flex items-center gap-1">
              <Calculator size={11} /> Cotización rápida (Excel con fórmulas reales)
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <input
                type="number"
                value={finanzasForm.precio}
                onChange={(e) => setFinanzasForm((p) => ({ ...p, precio: e.target.value }))}
                placeholder="Precio de venta"
                className="bg-base-900 border border-base-600 rounded-md px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
              />
              <input
                type="number"
                value={finanzasForm.costo}
                onChange={(e) => setFinanzasForm((p) => ({ ...p, costo: e.target.value }))}
                placeholder="Costo unitario"
                className="bg-base-900 border border-base-600 rounded-md px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
              />
              <input
                type="number"
                value={finanzasForm.unidadesMes}
                onChange={(e) => setFinanzasForm((p) => ({ ...p, unidadesMes: e.target.value }))}
                placeholder="Unidades/mes"
                className="bg-base-900 border border-base-600 rounded-md px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
              />
              <input
                type="number"
                value={finanzasForm.gastosFijos}
                onChange={(e) => setFinanzasForm((p) => ({ ...p, gastosFijos: e.target.value }))}
                placeholder="Gastos fijos/mes"
                className="bg-base-900 border border-base-600 rounded-md px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
              />
              <input
                type="number"
                value={finanzasForm.crecimiento}
                onChange={(e) => setFinanzasForm((p) => ({ ...p, crecimiento: e.target.value }))}
                placeholder="Crecimiento %/mes (opcional)"
                className="col-span-2 bg-base-900 border border-base-600 rounded-md px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
              />
            </div>
            {finanzasError && <div className="text-[10px] text-red-300 mt-1.5">{finanzasError}</div>}
            <div className="flex gap-1.5 mt-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => generarExcelFinanciero("cotizacion")}
                disabled={generandoExcel !== null}
              >
                {generandoExcel === "cotizacion" ? <Loader2 size={12} className="animate-spin" /> : null}
                Excel cotización
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generarExcelFinanciero("completo")}
                disabled={generandoExcel !== null}
              >
                {generandoExcel === "completo" ? <Loader2 size={12} className="animate-spin" /> : null}
                Excel financiero completo
              </Button>
            </div>
          </details>
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
        <Button size="sm" variant={mode === "warroom" ? "primary" : "outline"} onClick={() => setMode("warroom")}>
          <Flame size={13} /> 🔥 Lanzar Reunión War Room
        </Button>
      </div>

      {mode === "warroom" && (
        <div className="text-[11px] text-gray-400 mb-2 rounded-md border border-base-700 bg-base-900 px-2.5 py-1.5">
          Cadena real: 🎯 Estrategia → 📣 Marketing → 💰 Finanzas → 🧭 Resumen final del analista. Cada agente ve
          completo lo que dijo el anterior sobre este mismo proyecto — no es una ronda en paralelo.
        </div>
      )}

      {mode === "single" && (
        <select
          value={singleAgent}
          onChange={(e) => setSingleAgent(e.target.value)}
          className="bg-base-800 border border-base-600 text-sm text-gray-100 rounded-lg px-3 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        >
          <option value="" disabled>
            -- Elegí un agente --
          </option>
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
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xlsm,.xls,.csv"
            className="hidden"
            onChange={onExcelSelected}
          />

          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingPdf}>
              {uploadingPdf ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} />}
              {uploadingPdf ? "Extrayendo..." : "📄 Subir PDF"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => excelInputRef.current?.click()}
              disabled={uploadingExcel}
            >
              {uploadingExcel ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
              {uploadingExcel ? "Leyendo..." : "📊 Subir Excel"}
            </Button>
            <Button size="sm" variant="outline" onClick={descargarUltimoExcel} disabled={!ultimoExcel}>
              <Download size={13} />
              📥 Descargar último Excel
            </Button>
            {(pdfAttachment || excelAttachment) && (
              <span className="text-[10px] text-gray-500 w-full">
                Se enviará a <span className="text-accent-400">{AGENTE_ANALISTA_SLUG}</span> con el/los documento(s)
                como contexto
              </span>
            )}
          </div>

          {pdfError && (
            <div className="text-[11px] text-red-300 mb-2 border border-red-600/30 bg-red-500/10 rounded-lg px-2.5 py-1.5">
              {pdfError}
            </div>
          )}
          {excelError && (
            <div className="text-[11px] text-red-300 mb-2 border border-red-600/30 bg-red-500/10 rounded-lg px-2.5 py-1.5">
              {excelError}
            </div>
          )}

          {pdfAttachment && (
            <div className="mb-2 rounded-lg border border-accent-500/30 bg-accent-500/10 px-2.5 py-1.5 text-[11px] text-accent-300">
              <div className="flex items-center gap-2">
                <FileText size={13} className="shrink-0" />
                <span className="truncate flex-1">
                  ✅ PDF leído: {pdfAttachment.title} - {pdfAttachment.paginas ?? "?"} páginas
                  {pdfAttachment.truncated ? " · texto truncado" : ""}
                </span>
                <button onClick={clearPdf} className="text-accent-300 hover:text-red-300 shrink-0" title="Quitar PDF">
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {excelAttachment && (
            <div className="mb-2 rounded-lg border border-accent-500/30 bg-accent-500/10 px-2.5 py-1.5 text-[11px] text-accent-300">
              <div className="flex items-center gap-2 mb-1.5">
                <FileSpreadsheet size={13} className="shrink-0" />
                <span className="truncate flex-1">
                  ✅ Excel leído: {excelAttachment.archivo} - {excelAttachment.hojas.length} hoja
                  {excelAttachment.hojas.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={clearExcel}
                  className="text-accent-300 hover:text-red-300 shrink-0"
                  title="Quitar Excel"
                >
                  <X size={13} />
                </button>
              </div>
              {excelAttachment.hojas.slice(0, 1).map((hoja) => (
                <div key={hoja.nombre} className="overflow-x-auto">
                  <div className="text-[10px] text-accent-200 mb-1">
                    Hoja "{hoja.nombre}" · {hoja.totalFilas} filas · preview primeras {hoja.filas.length}
                  </div>
                  <table className="text-[10px] text-gray-300 border-collapse">
                    <thead>
                      <tr>
                        {hoja.columnas.map((c, i) => (
                          <th key={i} className="border border-base-600 bg-base-800 px-1.5 py-0.5 text-left whitespace-nowrap">
                            {c || `Col ${i + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hoja.filas.map((fila, ri) => (
                        <tr key={ri}>
                          {fila.map((val, ci) => (
                            <td key={ci} className="border border-base-700 px-1.5 py-0.5 whitespace-nowrap">
                              {val === null ? "" : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              pdfAttachment || excelAttachment
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

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {results.map((r, i) => (
          <div key={i}>
            {mode === "warroom" && i > 0 && (
              <div className="text-center text-gray-600 text-xs leading-none py-0.5">↓</div>
            )}
            <div className="rounded-lg border border-base-700 bg-base-850 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge className={r.ok ? "bg-accent-500/20 text-accent-400" : "bg-red-500/20 text-red-400"}>
                  {mode === "warroom" ? `${i + 1}. ${WARROOM_THREAD_LABELS[r.agent] || r.agent}` : r.agent}
                </Badge>
              </div>
              {r.ok ? (
                <div className="markdown-body text-xs text-gray-300">
                  <ReactMarkdown>{r.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-xs text-red-300">{r.text}</div>
              )}
              {r.herramientas && r.herramientas.length > 0 && (
                <details className="mt-2 border-t border-base-700 pt-1.5">
                  <summary className="text-[10px] text-gray-500 cursor-pointer flex items-center gap-1">
                    <Wrench size={10} /> Herramientas reales usadas ({r.herramientas.length})
                  </summary>
                  <div className="mt-1 space-y-1">
                    {r.herramientas.map((h, hi) => (
                      <div key={hi} className="text-[10px] text-gray-400 bg-base-900 rounded px-1.5 py-1">
                        <span className="text-accent-400">{h.name}</span>(
                        {JSON.stringify(h.input)}) →{" "}
                        <span className="text-gray-300">{JSON.stringify(h.result)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
