"use client";

import { useState } from "react";
import { AgentSummary, IdeaActualPointer, IdeaSummary } from "@/lib/types";
import Header, { Modo } from "@/components/Header";
import IntakeColumn from "@/components/IntakeColumn";
import KanbanBoard from "@/components/KanbanBoard";
import WarRoomPanel from "@/components/WarRoomPanel";
import CapitalIdeaMode from "@/components/CapitalIdeaMode";
import NegocioExistenteMode from "@/components/NegocioExistenteMode";
import ClientesProductosPanel from "@/components/ClientesProductosPanel";
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
    <div className="grid grid-cols-4 gap-4 p-4 h-screen">
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

      {modo === "idea-empresa" && (
        <>
          <IntakeColumn onCreateIdea={onCreateIdea} />
          <KanbanBoard ideas={ideas} onStageChange={onStageChange} />
        </>
      )}

      {modo === "capital-idea" && <CapitalIdeaMode onGenerated={onModeGenerated} />}

      {modo === "negocio-existente" && <NegocioExistenteMode onGenerated={onModeGenerated} />}

      {modo === "clientes-productos" && <ClientesProductosPanel />}

      <WarRoomPanel
        agents={agents}
        apiKeyConfigured={apiKeyConfigured}
        projectId={pointer.archivo}
        projectLabel={
          pointer.archivo ? ideas.find((i) => i.file === pointer.archivo)?.title ?? pointer.ideaId : null
        }
      />

      <OpenTeamModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
