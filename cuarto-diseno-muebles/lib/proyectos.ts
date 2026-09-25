import fs from "fs";
import path from "path";

// Este dashboard vive separado del War Room (dashboard/), pero comparte la
// misma convención de memoria de cliente: `clientes/[cliente]/`. No importa
// nada del código del War Room, solo lee archivos de esa carpeta compartida.
const CLIENTES_DIR = path.join(process.cwd(), "..", "clientes");

// Carpetas dentro de `clientes/[cliente]/` que NUNCA son un proyecto físico
// de mueble (para no confundirlas al buscar carpetas tipo `cocina/`, `closet/`).
const CARPETAS_NO_PROYECTO = new Set(["outputs", "assets", ".git", "node_modules"]);

export type EtapaKey =
  | "interpretePlanos"
  | "arquitectoEspacio"
  | "ksmartEjecutor"
  | "presupuesto";

export interface ProyectoFisico {
  tipoProyecto: string; // ej. "cocina", "closet" — nombre real de la carpeta
  tieneSkp: boolean;
  tieneCortes: boolean;
  tieneRenders: boolean;
  tienePlanos: boolean;
  entregableCompleto: boolean;
}

export interface ProyectoMueble {
  cliente: string;
  tieneBrief: boolean;
  tieneProyectoMuebles: boolean;
  etapas: Record<EtapaKey, boolean>;
  proyectosFisicos: ProyectoFisico[];
}

// Las 4 primeras etapas siguen viviendo como resumen intermedio en
// outputs/muebles/ (JSON liviano para no tener que abrir el .skp).
const ETAPA_ARCHIVOS: Record<EtapaKey, string[]> = {
  interpretePlanos: ["arquitectura-base.json", "arquitectura-base.md"],
  arquitectoEspacio: ["plan-espacial.json", "plan-espacial.md"],
  ksmartEjecutor: ["ensamble-ksmart.json", "ensamble-ksmart.md"],
  presupuesto: ["presupuesto-final.md"],
};

function existeAlguno(dir: string, nombres: string[]): boolean {
  return nombres.some((n) => fs.existsSync(path.join(dir, n)));
}

function tieneArchivosConExtension(dir: string, ext: string): boolean {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((f) => f.toLowerCase().endsWith(ext));
}

function dirNoVacio(dir: string): boolean {
  return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
}

// El entregable final físico vive en `clientes/[cliente]/[tipo-proyecto]/`
// (ej. cocina/, closet/) con: un .skp en la raíz, y las subcarpetas
// cortes/, renders/, planos/ — ver agente-director-cuarto-muebles.md.
function getProyectosFisicos(clienteDir: string): ProyectoFisico[] {
  if (!fs.existsSync(clienteDir)) return [];

  return fs
    .readdirSync(clienteDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !CARPETAS_NO_PROYECTO.has(d.name))
    .map((d) => {
      const proyectoDir = path.join(clienteDir, d.name);
      const tieneSkp = tieneArchivosConExtension(proyectoDir, ".skp");
      const tieneCortes = dirNoVacio(path.join(proyectoDir, "cortes"));
      const tieneRenders = dirNoVacio(path.join(proyectoDir, "renders"));
      const tienePlanos = dirNoVacio(path.join(proyectoDir, "planos"));
      return {
        tipoProyecto: d.name,
        tieneSkp,
        tieneCortes,
        tieneRenders,
        tienePlanos,
        entregableCompleto: tieneSkp && tieneCortes && tieneRenders && tienePlanos,
      };
    })
    // Solo mostramos carpetas que realmente parecen un proyecto de mueble
    // (al menos una de las 4 partes presente) — así no listamos cualquier
    // carpeta suelta del cliente que no tenga nada que ver con esto.
    .filter((p) => p.tieneSkp || p.tieneCortes || p.tieneRenders || p.tienePlanos);
}

export function getProyectosMuebles(): ProyectoMueble[] {
  if (!fs.existsSync(CLIENTES_DIR)) return [];

  const clientes = fs
    .readdirSync(CLIENTES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  return clientes.map((cliente) => {
    const base = path.join(CLIENTES_DIR, cliente);
    const muebleDir = path.join(base, "outputs", "muebles");
    const tieneBrief =
      fs.existsSync(path.join(base, "brief.md")) ||
      fs.existsSync(path.join(base, "README.md"));
    const tieneProyectoMuebles = fs.existsSync(muebleDir);

    const etapas = Object.fromEntries(
      (Object.keys(ETAPA_ARCHIVOS) as EtapaKey[]).map((etapa) => [
        etapa,
        tieneProyectoMuebles && existeAlguno(muebleDir, ETAPA_ARCHIVOS[etapa]),
      ])
    ) as Record<EtapaKey, boolean>;

    const proyectosFisicos = getProyectosFisicos(base);

    return { cliente, tieneBrief, tieneProyectoMuebles, etapas, proyectosFisicos };
  });
}
