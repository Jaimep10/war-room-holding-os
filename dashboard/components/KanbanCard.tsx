"use client";

import { Draggable } from "@hello-pangea/dnd";
import { IdeaSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { riskColor, cn } from "@/lib/utils";

export default function KanbanCard({ idea, index }: { idea: IdeaSummary; index: number }) {
  return (
    <Draggable draggableId={idea.file} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded-lg border border-base-600 bg-base-800 p-3 mb-2.5 cursor-grab active:cursor-grabbing",
            snapshot.isDragging && "ring-2 ring-accent-500 shadow-xl"
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-accent-400">{idea.id}</span>
            <Badge>{idea.giro}</Badge>
          </div>
          <div className="text-sm font-medium text-gray-100 mb-2 leading-snug">{idea.title}</div>
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-gray-400">
              Score <span className="text-gray-100 font-semibold">{idea.score ?? "—"}/10</span>
            </span>
            <span className={cn("rounded-full px-2 py-0.5", riskColor(idea.riesgo))}>
              {idea.riesgo ?? "Sin evaluar"}
            </span>
            <span className="text-gray-400">
              Confianza <span className="text-gray-100 font-semibold">{idea.confianza ?? "—"}%</span>
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
