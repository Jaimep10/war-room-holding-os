"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { DeliverableDef } from "@/lib/types";

const DELIVERABLES: DeliverableDef[] = [
  { tipo: "Manual Operativo", agente: "agente-operaciones", label: "Manual Operativo" },
  { tipo: "Contratos Clave", agente: "agente-legal", label: "Contratos" },
  { tipo: "SOPs Críticos", agente: "agente-operaciones", label: "SOPs" },
  { tipo: "Tabla de Compras (3 proveedores)", agente: "agente-compras-procurement", label: "Tabla Compras" },
  { tipo: "Guion de Ventas", agente: "marketing-copywriting", label: "Guión de Ventas" },
  { tipo: "Oferta Irresistible", agente: "marketing-copywriting", label: "Oferta Irresistible" },
  { tipo: "Stack Tecnológico Recomendado", agente: "agente-operaciones", label: "Stack Tecnológico" },
  { tipo: "Plan de Retención", agente: "marketing-crm-retention", label: "Plan Retención" },
];

export default function DeliverablesPanel({ apiKeyConfigured }: { apiKeyConfigured: boolean }) {
  const [files, setFiles] = useState<string[]>([]);
  const [loadingTipo, setLoadingTipo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshFiles() {
    const res = await fetch("/api/deliverables");
    const data = await res.json();
    setFiles(data.files ?? []);
  }

  useEffect(() => {
    refreshFiles();
  }, []);

  async function generate(d: DeliverableDef) {
    setLoadingTipo(d.tipo);
    setError(null);
    try {
      const res = await fetch("/api/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: d.tipo, agentSlug: d.agente }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        await refreshFiles();
      }
    } finally {
      setLoadingTipo(null);
    }
  }

  function fileNameFor(d: DeliverableDef) {
    const slug = d.tipo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join("-");
    return `${slug}.md`;
  }

  return (
    <div className="flex flex-col h-full">
      {error && <div className="text-[11px] text-red-300 mb-2 border border-red-600/30 bg-red-500/10 rounded-lg p-2">{error}</div>}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {DELIVERABLES.map((d) => {
          const exists = files.includes(fileNameFor(d));
          return (
            <div key={d.tipo} className="rounded-lg border border-base-700 bg-base-850 p-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-100 flex items-center gap-1.5">
                  <FileText size={13} className="text-accent-400 shrink-0" />
                  {d.label}
                </div>
                <div className="text-[10px] text-gray-500 truncate">Agente: {d.agente}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {exists && (
                  <a
                    href={`/api/deliverables/file?file=${encodeURIComponent(fileNameFor(d))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-accent-400 p-1.5 rounded-md hover:bg-base-800"
                    title="Descargar"
                  >
                    <Download size={14} />
                  </a>
                )}
                <Button size="sm" variant={exists ? "outline" : "primary"} onClick={() => generate(d)} disabled={loadingTipo === d.tipo || !apiKeyConfigured}>
                  {loadingTipo === d.tipo ? <Loader2 size={12} className="animate-spin" /> : null}
                  {exists ? "Regenerar" : "Generar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {!apiKeyConfigured && (
        <div className="text-[11px] text-gray-500 mt-2">
          Configura <code>ANTHROPIC_API_KEY</code> para poder generar entregables.
        </div>
      )}
    </div>
  );
}
