"use client";

import { useState } from "react";
import { AgentSummary, IdeaActualPointer, IdeaSummary } from "@/lib/types";
import Header, { Modo } from "@/components/Header";
import IntakeColumn from "@/components/IntakeColumn";
import WarRoomPanel from "@/components/WarRoomPanel";
import CapitalIdeaMode from "@/components/CapitalIdeaMode";
import NegocioExistenteMode from "@/components/NegocioExistenteMode";
import ClientesProductosPanel from "@/components/ClientesProductosPanel";
import ClientesSidebar from "@/components/ClientesSidebar";
import AccionRapida from "@/components/AccionRapida";
import HostingerConnect from "@/components/HostingerConnect";
import OpenTeamModal from "@/components/OpenTeamModal";

export default function Dashboard({
  initialIdeas,
  initialCurrent,
  agents,
  apiKeyConfigured,
}: {
  initialIdeas: IdeaSummary[];
  initialCurrent: IdeaActualPointer;
  agents: AgentSummary[];
  apiKeyConfigured: boolean;
}) {
  const [ideas, setIdeas] = useState<IdeaSummary[]>(initialIdeas);
  const [pointer, setPointer] = useState<IdeaActualPointer>(
    initialCurrent ?? { ideaId: null, archivo: null, rubro: null }
  );
  const [modo, setModo] = useState<Modo>("idea-empresa");
  const [demoOpen, setDemoOpen] = useState(false);
  // Cliente activo para Acción Rápida / sidebar -- vive acá (no en localStorage) porque es
  // una selección de la sesión de trabajo, no un dato persistente del cliente en sí.
  const [clienteActivoSlug, setClienteActivoSlug] = useState<string | null>(null);

  async function refreshIdeas() {
    const res = await fetch("/api/ideas");
    const data = await res.json();
    setIdeas(data.ideas ?? []);
  }

  async function refreshCurrent() {
    const res = await fetch("/api/ideas/current");
    const data = await res.json();
    setPointer(data.pointer ?? { ideaId: null, archivo: null, rubro: null });
  }

  async function onSelectIdea(file: string) {
    await fetch("/api/ideas/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    });
    await refreshCurrent();
  }

  async function onCreateIdea(descripcion: string) {
    await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion }),
    });
    await Promise.all([refreshIdeas(), refreshCurrent()]);
  }

  async function onNewProject() {
    // "Nuevo Proyecto" = aislamiento estricto (Principio #2, Parte B): crea un IDEA-N nuevo,
    // que automáticamente pasa a ser IDEA-ACTUAL. Al no existir todavía su
    // warroom_memoria_{projectId} en localStorage, el Chat arranca con memoria 100% limpia
    // para este proyecto — sin mezclar nada de ningún otro proyecto/idea.
    const descripcion = window.prompt("Describe brevemente el nuevo proyecto (una o dos líneas):");
    if (!descripcion || !descripcion.trim()) return;
    await onCreateIdea(descripcion.trim());
    if (modo !== "idea-empresa") setModo("idea-empresa");
  }

  async function onStageChange(file: string, etapa: string) {
    setIdeas((prev) => prev.map((i) => (i.file === file ? { ...i, etapa } : i)));
    await fetch("/api/ideas/stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, etapa }),
    });
  }

  async function onModeGenerated() {
    await Promise.all([refreshIdeas(), refreshCurrent()]);
  }

  return (
    // Layout 80/20: sidebar de clientes (colapsable, ~20%) a la izquierda + columna
    // principal (~80%) a la derecha, con el Chat/War Room ocupando la mayor parte del
    // alto (arriba) y la caja de escribir la orden grande y fija abajo (ver ChatPanel).
    // Antes esto era un grid-cols-4 con el Kanban de 4 columnas (col-span-2, casi siempre
    // "Sin ideas aquí") comiéndose la mitad de la pantalla -- se sacó de acá (el archivo
    // components/KanbanBoard.tsx sigue existiendo, solo se dejó de renderizar).
    <div className="flex flex-col h-screen p-4 gap-4">
      <Header
        ideas={ideas}
        currentFile={pointer.archivo}
        onSelectIdea={onSelectIdea}
        onOpenDemo={() => setDemoOpen(true)}
        onNewProject={onNewProject}
        rubroActual={pointer.rubro}
        modo={modo}
        onModoChange={setModo}
        totalAgentes={agents.length}
      />

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        <ClientesSidebar clienteActivoSlug={clienteActivoSlug} onSelectCliente={setClienteActivoSlug} />

        <div className="flex-1 flex flex-col gap-3 overflow-hidden min-w-0 min-h-0">
          <AccionRapida
            agents={agents}
            clienteActivoSlug={clienteActivoSlug}
            onClienteChange={setClienteActivoSlug}
          />

          {modo === "idea-empresa" && (
            <details className="shrink-0 rounded-xl border border-base-700 bg-base-900/60 p-3">
              <summary className="text-xs font-semibold text-gray-300 cursor-pointer list-none">
                ➕ Nueva idea desde cero (Idea Intake)
              </summary>
              <div className="mt-2 max-h-[38vh] overflow-y-auto">
                <IntakeColumn onCreateIdea={onCreateIdea} />
              </div>
            </details>
          )}

          {modo === "capital-idea" && (
            <div className="grid grid-cols-3 gap-4 shrink-0 max-h-[42vh]">
              <CapitalIdeaMode onGenerated={onModeGenerated} />
            </div>
          )}

          {modo === "negocio-existente" && (
            <div className="grid grid-cols-3 gap-4 shrink-0 max-h-[42vh]">
              <NegocioExistenteMode onGenerated={onModeGenerated} />
            </div>
          )}

          {modo === "clientes-productos" && (
            <div className="grid grid-cols-3 gap-4 shrink-0 max-h-[42vh]">
              <ClientesProductosPanel />
            </div>
          )}

          <HostingerConnect />

          <WarRoomPanel
            agents={agents}
            apiKeyConfigured={apiKeyConfigured}
            projectId={pointer.archivo}
            projectLabel={
              pointer.archivo ? ideas.find((i) => i.file === pointer.archivo)?.title ?? pointer.ideaId : null
            }
          />
        </div>
      </div>

      <OpenTeamModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
