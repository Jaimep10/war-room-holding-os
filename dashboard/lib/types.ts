export interface IdeaSummary {
  file: string;
  id: string; // e.g. IDEA-1
  title: string;
  giro: string;
  etapa: string;
  score: number | null;
  riesgo: string | null;
  confianza: number | null;
}

export interface IdeaFull extends IdeaSummary {
  content: string;
}

export interface IdeaActualPointer {
  ideaId: string | null;
  archivo: string | null;
  rubro: string | null;
}

export type AgentGroup = "principal" | "marketing";

export interface AgentSummary {
  slug: string;
  name: string;
  description: string;
  group: AgentGroup;
  relPath: string;
}

export interface AgentResponse {
  agent: string;
  ok: boolean;
  text: string;
}

export interface DeliverableDef {
  tipo: string;
  agente: string;
  label: string;
}
