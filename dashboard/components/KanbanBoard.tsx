"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { IdeaSummary } from "@/lib/types";
import KanbanCard from "@/components/KanbanCard";
import { cn } from "@/lib/utils";

export const STAGES = [
  { key: "Filtro 1 - Viabilidad", label: "Filtro 1 · Viabilidad", sub: "Pesimista + Analista" },
  { key: "Filtro 2 - Estrategia", label: "Filtro 2 · Estrategia", sub: "Director" },
  { key: "Filtro 3 - Finanzas", label: "Filtro 3 · Finanzas", sub: "Finanzas + Compras" },
  { key: "Aprobado", label: "Aprobado", sub: "Marketing + Operaciones + Legal" },
];

export default function KanbanBoard({
  ideas,
  onStageChange,
}: {
  ideas: IdeaSummary[];
  onStageChange: (file: string, etapa: string) => void;
}) {
  function handleDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStage = destination.droppableId;
    onStageChange(draggableId, newStage);
  }

  return (
    <div className="col-span-2 rounded-xl border border-base-700 bg-base-900/60 p-4 flex flex-col overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Pipeline · Kanban</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-3 flex-1 overflow-hidden">
          {STAGES.map((stage) => {
            const stageIdeas = ideas.filter((i) => i.etapa === stage.key);
            return (
              <div key={stage.key} className="flex flex-col rounded-lg bg-base-850 border border-base-700 overflow-hidden">
                <div className="px-3 py-2 border-b border-base-700 bg-base-800/60">
                  <div className="text-xs font-semibold text-gray-200">{stage.label}</div>
                  <div className="text-[10px] text-gray-500">{stage.sub}</div>
                </div>
                <Droppable droppableId={stage.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 overflow-y-auto p-2 min-h-[120px] transition-colors",
                        snapshot.isDraggingOver && "bg-accent-500/5"
                      )}
                    >
                      {stageIdeas.length === 0 && (
                        <div className="text-[11px] text-gray-600 text-center mt-4">Sin ideas aquí</div>
                      )}
                      {stageIdeas.map((idea, index) => (
                        <KanbanCard key={idea.file} idea={idea} index={index} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
