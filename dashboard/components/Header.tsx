"use client";

import { IdeaSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Radar, ShieldAlert, Lightbulb, Wallet, TrendingUp } from "lucide-react";

export type Modo = "idea-empresa" | "capital-idea" | "negocio-existente";

const MODOS: { key: Modo; label: string; icon: React.ReactNode }[] = [
  { key: "idea-empresa", label: "Idea → Empresa", icon: <Lightbulb size={13} /> },
  { key: "capital-idea", label: "Capital → Idea", icon: <Wallet size={13} /> },
  { key: "negocio-existente", label: "Mejorar Negocio", icon: <TrendingUp size={13} /> },
];

export default function Header({
  ideas,
  currentFile,
  onSelectIdea,
  onOpenDemo,
  rubroActual,
  modo,
  onModoChange,
  totalAgentes,
}: {
  ideas: IdeaSummary[];
  currentFile: string | null;
  onSelectIdea: (file: string) => void;
  onOpenDemo: () => void;
  rubroActual: string | null;
  modo: Modo;
  onModoChange: (m: Modo) => void;
  totalAgentes: number;
}) {
  return (
    <header className="col-span-4 flex flex-wrap items-center justify-between gap-3 border-b border-base-700 bg-base-900/80 px-5 py-3 rounded-xl mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center text-accent-400">
          <Radar size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide text-gray-100">WAR ROOM</div>
          <div className="text-[11px] text-gray-500 -mt-0.5">Idea to Empresa · {totalAgentes} agentes</div>
        </div>
      </div>

      {/* Toggle de 3 modos, estilo Linear */}
      <div className="inline-flex items-center gap-0.5 rounded-lg bg-base-800 border border-base-600 p-1">
        {MODOS.map((m) => (
          <button
            key={m.key}
            onClick={() => onModoChange(m.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              modo === m.key ? "bg-accent-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-200 hover:bg-base-700"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {modo === "idea-empresa" ? (
          <div className="flex flex-col items-end">
            <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-0.5">
              IDEA-ACTUAL {rubroActual ? `· ${rubroActual}` : ""}
            </label>
            <select
              value={currentFile ?? ""}
              onChange={(e) => onSelectIdea(e.target.value)}
              className="bg-base-800 border border-base-600 text-sm text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50 min-w-[260px]"
            >
              {ideas.length === 0 && <option value="">Sin ideas todavía</option>}
              {ideas.map((idea) => (
                <option key={idea.file} value={idea.file}>
                  {idea.id} — {idea.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-0.5">IDEA-ACTUAL</label>
            <div className="text-xs text-gray-300 max-w-[260px] truncate">{currentFile ?? "—"}</div>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={onOpenDemo}>
          <ShieldAlert size={14} />
          Prueba: Equipo Abierto
        </Button>
      </div>
    </header>
  );
}
