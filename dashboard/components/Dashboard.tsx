"use client";

import { useState } from "react";
import { AgentSummary, IdeaActualPointer, IdeaSummary } from "@/lib/types";
import Header, { Modo } from "@/components/Header";
import IntakeColumn from "@/components/IntakeColumn";
import KanbanBoard from "@/components/KanbanBoard";
import WarRoomPanel from "@/components/WarRoomPanel";
import CapitalIdeaMode from "@/components/CapitalIdeaMode";
import NegocioExistenteMode from "@/components/NegocioExistenteMode";
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

      <WarRoomPanel agents={agents} apiKeyConfigured={apiKeyConfigured} />

      <OpenTeamModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
