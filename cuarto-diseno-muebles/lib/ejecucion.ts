import fs from "fs";
import path from "path";

// Estado de ejecución manual y parcial por proyecto físico. Lo lee y
// actualiza `agente-director-cuarto-muebles` (ver su .md), y lo escribe este
// dashboard cuando el usuario aprieta un botón o tilda un checkbox.
const CLIENTES_DIR = path.join(process.cwd(), "..", "clientes");

export type Parte = "cortes" | "presupuesto" | "renders" | "planos";

export type EstadoEjecucionKey =
  | "sin_solicitar"
  | "borrador_solicitado"
  | "borrador_listo_pendiente_aprobacion"
  | "aprobado"
  | "completo_solicitado"
  | "completo";

export interface EstadoEjecucion {
  modoSolicitado: "borrador" | "completo" | null;
  partesSolicitadas: Record<Parte, boolean>;
  estado: EstadoEjecucionKey;
  aprobado: boolean;
  historial: { evento: string; timestamp: string }[];
}

const PARTES_VACIAS: Record<Parte, boolean> = {
  cortes: false,
  presupuesto: false,
  renders: false,
  planos: false,
};

const ESTADO_VACIO: EstadoEjecucion = {
  modoSolicitado: null,
  partesSolicitadas: { ...PARTES_VACIAS },
  estado: "sin_solicitar",
  aprobado: false,
  historial: [],
};

function proyectoDir(cliente: string, tipoProyecto: string) {
  return path.join(CLIENTES_DIR, cliente, tipoProyecto);
}

function ejecucionPath(cliente: string, tipoProyecto: string) {
  return path.join(proyectoDir(cliente, tipoProyecto), "ejecucion.json");
}

export function leerEjecucion(cliente: string, tipoProyecto: string): EstadoEjecucion {
  const p = ejecucionPath(cliente, tipoProyecto);
  if (!fs.existsSync(p)) {
    return { ...ESTADO_VACIO, partesSolicitadas: { ...PARTES_VACIAS } };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    return { ...ESTADO_VACIO, ...raw, partesSolicitadas: { ...PARTES_VACIAS, ...raw.partesSolicitadas } };
  } catch {
    return { ...ESTADO_VACIO, partesSolicitadas: { ...PARTES_VACIAS } };
  }
}

function escribir(cliente: string, tipoProyecto: string, estado: EstadoEjecucion) {
  fs.mkdirSync(proyectoDir(cliente, tipoProyecto), { recursive: true });
  fs.writeFileSync(ejecucionPath(cliente, tipoProyecto), JSON.stringify(estado, null, 2));
}

function conHistorial(estado: EstadoEjecucion, evento: string): EstadoEjecucion {
  return { ...estado, historial: [...estado.historial, { evento, timestamp: new Date().toISOString() }] };
}

// Modo Borrador: SIEMPRE y solo el .skp — ninguna de las 4 partes
// (cortes/presupuesto/renders/planos) se toca en este modo, sin importar qué
// tenía tildado el usuario antes. Así lo pidió explícitamente el usuario.
export function solicitarBorrador(cliente: string, tipoProyecto: string): EstadoEjecucion {
  const actual = leerEjecucion(cliente, tipoProyecto);
  const nuevo = conHistorial(
    {
      ...actual,
      modoSolicitado: "borrador",
      partesSolicitadas: { ...PARTES_VACIAS },
      estado: "borrador_solicitado",
    },
    "Usuario solicitó Ejecutar Borrador (solo .skp — sin cortes, presupuesto, renders ni planos)"
  );
  escribir(cliente, tipoProyecto, nuevo);
  return nuevo;
}

// Modo Completo: respeta lo que el usuario haya tildado en los checkboxes
// (puede ser parcial, ej. solo Cortes + Planos). Si el borrador de este
// proyecto ya fue aprobado, el director puede ir directo a completar. Si no,
// igual queda registrado el pedido, pero el director (por su propio gate
// obligatorio) va a generar/confirmar el borrador primero y pausar para
// aprobación — el dashboard no se salta ese paso escribiendo el estado como
// si ya estuviera aprobado.
export function solicitarCompleto(cliente: string, tipoProyecto: string): EstadoEjecucion {
  const actual = leerEjecucion(cliente, tipoProyecto);
  const nuevo = conHistorial(
    {
      ...actual,
      modoSolicitado: "completo",
      // usa las partes ya tildadas (vía actualizarPartes) — no las pisa
      estado: actual.aprobado ? "completo_solicitado" : "borrador_solicitado",
    },
    actual.aprobado
      ? "Usuario solicitó Ejecutar Completo"
      : "Usuario solicitó Ejecutar Completo sin haber aprobado un borrador todavía — el director debe generar/confirmar el borrador y pausar para aprobación antes de continuar"
  );
  escribir(cliente, tipoProyecto, nuevo);
  return nuevo;
}

export function aprobarBorrador(cliente: string, tipoProyecto: string): EstadoEjecucion {
  const actual = leerEjecucion(cliente, tipoProyecto);
  const nuevo = conHistorial(
    { ...actual, aprobado: true, estado: "aprobado" },
    'Usuario respondió "sí" a BORRADOR_LISTO: ¿Apruebas para entregables?'
  );
  escribir(cliente, tipoProyecto, nuevo);
  return nuevo;
}

// Ajuste manual y parcial: el usuario tilda/destilda checkboxes puntuales
// (ej. solo quiere re-generar Planos) sin pasar por los 2 botones canónicos.
export function actualizarPartes(
  cliente: string,
  tipoProyecto: string,
  partes: Partial<Record<Parte, boolean>>
): EstadoEjecucion {
  const actual = leerEjecucion(cliente, tipoProyecto);
  const nuevo = conHistorial(
    { ...actual, partesSolicitadas: { ...actual.partesSolicitadas, ...partes } },
    "Usuario ajustó manualmente las partes solicitadas"
  );
  escribir(cliente, tipoProyecto, nuevo);
  return nuevo;
}
