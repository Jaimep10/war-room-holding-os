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

export interface HerramientaUsada {
  name: string;
  input: any;
  result: any;
}

export interface AgentResponse {
  agent: string;
  ok: boolean;
  text: string;
  /** Fase 3: qué herramientas reales (calcularFinanzas/buscarMercado) usó el agente, si usó alguna. */
  herramientas?: HerramientaUsada[];
}

export interface DeliverableDef {
  tipo: string;
  agente: string;
  label: string;
}

// ---------- Clientes (clientes/<slug>/) y Productos (producto/<slug>/) ----------

export interface ClienteSummary {
  slug: string;
  nombre: string;
  archivos: string[]; // .md sueltos en la raíz de la carpeta del cliente
  kitRedes: string[]; // archivos dentro de kit-redes/, si existe
  modoAbierto: boolean; // detectado por README.md mencionando "Modo Abierto"
}

export interface ProductoSummary {
  slug: string;
  nombre: string;
  archivos: string[];
}
