// Memoria por proyecto — vive en el navegador (localStorage), NO en el filesystem.
//
// OJO nombre: esto es distinto de lib/memoria.ts (que lee/escribe memoria/ideas/*.md en disco
// y lo usan TODOS los agentes vía las rutas de API). Si este archivo se hubiera llamado
// también "memoria.ts" habría reemplazado esa base crítica — se llama "projectMemory.ts" a
// propósito para no romper nada del sistema de archivos que ya usan los 20 agentes.
//
// "projectId" = el mismo identificador que ya usa todo el dashboard para "la idea activa"
// (pointer.archivo, ej. "IDEA-3-egeco-acabados.md"). No se inventa un segundo concepto de
// "proyecto" paralelo al de IDEA-ACTUAL — es el mismo, para que todo el sistema (agentes +
// dashboard) hable de la misma unidad de aislamiento (Principio #2, Parte B).

export type TipoNegocio = "producto" | "servicio" | "hibrido";

export interface ArchivoSubido {
  titulo: string;
  chars: number;
  agregadoEn: string; // ISO date
}

export interface DecisionHistorial {
  fecha: string; // ISO date
  agente: string;
  resumen: string;
}

export interface ProjectMemory {
  projectId: string;
  tipoNegocio: TipoNegocio | null;
  descripcion: string;
  archivosSubidos: ArchivoSubido[];
  contextoClave: string[];
  historialDecisiones: DecisionHistorial[];
  actualizadoEn: string;
}

const PREFIX = "warroom_memoria_";

function storageKey(projectId: string): string {
  return `${PREFIX}${projectId}`;
}

function emptyMemory(projectId: string): ProjectMemory {
  return {
    projectId,
    tipoNegocio: null,
    descripcion: "",
    archivosSubidos: [],
    contextoClave: [],
    historialDecisiones: [],
    actualizadoEn: new Date().toISOString(),
  };
}

export function loadProjectMemory(projectId: string): ProjectMemory {
  const pid = projectId || "sin-proyecto";
  if (typeof window === "undefined") return emptyMemory(pid);
  try {
    const raw = window.localStorage.getItem(storageKey(pid));
    if (!raw) return emptyMemory(pid);
    const parsed = JSON.parse(raw);
    // Saneamos por si la forma cambia entre versiones del dashboard — nunca reventar la UI
    // por un registro viejo o corrupto.
    return {
      ...emptyMemory(pid),
      ...parsed,
      projectId: pid,
      archivosSubidos: Array.isArray(parsed?.archivosSubidos) ? parsed.archivosSubidos : [],
      contextoClave: Array.isArray(parsed?.contextoClave) ? parsed.contextoClave : [],
      historialDecisiones: Array.isArray(parsed?.historialDecisiones) ? parsed.historialDecisiones : [],
    };
  } catch {
    return emptyMemory(pid);
  }
}

function persist(memory: ProjectMemory): ProjectMemory {
  if (typeof window === "undefined") return memory;
  const withTimestamp = { ...memory, actualizadoEn: new Date().toISOString() };
  try {
    window.localStorage.setItem(storageKey(memory.projectId), JSON.stringify(withTimestamp));
  } catch {
    // localStorage lleno o bloqueado (modo privado, etc.) - no rompemos la UI por esto.
  }
  return withTimestamp;
}

export function saveProjectMemory(memory: ProjectMemory): ProjectMemory {
  return persist(memory);
}

export function setTipoNegocio(projectId: string, tipo: TipoNegocio): ProjectMemory {
  const memory = loadProjectMemory(projectId);
  memory.tipoNegocio = tipo;
  return persist(memory);
}

export function setDescripcion(projectId: string, descripcion: string): ProjectMemory {
  const memory = loadProjectMemory(projectId);
  memory.descripcion = descripcion;
  return persist(memory);
}

export function addArchivoSubido(projectId: string, archivo: ArchivoSubido): ProjectMemory {
  const memory = loadProjectMemory(projectId);
  memory.archivosSubidos = [...memory.archivosSubidos, archivo].slice(-20);
  return persist(memory);
}

export function addContextoClave(projectId: string, texto: string): ProjectMemory {
  const memory = loadProjectMemory(projectId);
  const t = texto.trim();
  if (t && !memory.contextoClave.includes(t)) {
    memory.contextoClave = [...memory.contextoClave, t].slice(-30);
    return persist(memory);
  }
  return memory;
}

export function removeContextoClave(projectId: string, texto: string): ProjectMemory {
  const memory = loadProjectMemory(projectId);
  memory.contextoClave = memory.contextoClave.filter((c) => c !== texto);
  return persist(memory);
}

export function addDecision(projectId: string, agente: string, resumen: string): ProjectMemory {
  const memory = loadProjectMemory(projectId);
  memory.historialDecisiones = [
    ...memory.historialDecisiones,
    { fecha: new Date().toISOString(), agente, resumen: resumen.slice(0, 400) },
  ].slice(-50);
  return persist(memory);
}

/** Para "Nuevo Proyecto": un projectId nuevo ya nace sin registro, esto es solo para
 * limpiar explícitamente uno existente si el usuario lo pide. */
export function resetProjectMemory(projectId: string): ProjectMemory {
  return persist(emptyMemory(projectId || "sin-proyecto"));
}

/** Bloque en Markdown listo para inyectar en el prompt del agente. */
export function buildMemoriaContextBlock(memory: ProjectMemory): string {
  const partes: string[] = [];
  partes.push(`## MEMORIA DEL PROYECTO (persistida en el navegador — projectId: ${memory.projectId})`);
  partes.push(
    `**Tipo de negocio confirmado por el usuario:** ${
      memory.tipoNegocio
        ? memory.tipoNegocio.toUpperCase()
        : "AÚN NO DEFINIDO."
    }`
  );
  if (memory.descripcion.trim()) {
    partes.push(`**Descripción guardada del proyecto:**\n${memory.descripcion.trim()}`);
  }
  if (memory.contextoClave.length) {
    partes.push(`**Contexto clave acumulado por el usuario:**\n${memory.contextoClave.map((c) => `- ${c}`).join("\n")}`);
  }
  if (memory.archivosSubidos.length) {
    partes.push(
      `**Documentos ya subidos a este proyecto:**\n${memory.archivosSubidos
        .map((a) => `- ${a.titulo} (${a.chars} caracteres, ${a.agregadoEn.slice(0, 10)})`)
        .join("\n")}`
    );
  }
  if (memory.historialDecisiones.length) {
    const ultimas = memory.historialDecisiones.slice(-5);
    partes.push(
      `**Últimas respuestas/decisiones registradas en este proyecto:**\n${ultimas
        .map((d) => `- [${d.fecha.slice(0, 10)}] ${d.agente}: ${d.resumen}`)
        .join("\n")}`
    );
  }
  return partes.join("\n\n");
}
