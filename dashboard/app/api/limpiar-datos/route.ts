import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * dashboard/data — pedido explícito del usuario ("borre archivos de
 * dashboard/data/* si existen"). OJO: el estado real del dashboard (ideas,
 * agentes, entregables) vive en ../memoria/ (ver lib/memoria.ts), NO acá.
 * Esta carpeta hoy no existe en el repo; este endpoint solo actúa si aparece.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const TRASH_DIRNAME = "_borrado";

export async function POST() {
  if (!fs.existsSync(DATA_DIR)) {
    return NextResponse.json({ ok: true, movidos: [], nota: "dashboard/data no existe, nada que limpiar." });
  }

  const entradas = fs.readdirSync(DATA_DIR).filter((f) => f !== TRASH_DIRNAME);
  if (entradas.length === 0) {
    return NextResponse.json({ ok: true, movidos: [], nota: "dashboard/data está vacío." });
  }

  // Cuarentena, no rm: mueve todo a data/_borrado/<timestamp>/ en vez de borrar
  // de verdad, para que un click accidental en el botón no sea irreversible.
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const trashDir = path.join(DATA_DIR, TRASH_DIRNAME, timestamp);
  fs.mkdirSync(trashDir, { recursive: true });

  const movidos: string[] = [];
  for (const entrada of entradas) {
    fs.renameSync(path.join(DATA_DIR, entrada), path.join(trashDir, entrada));
    movidos.push(entrada);
  }

  return NextResponse.json({ ok: true, movidos, trashDir: path.relative(process.cwd(), trashDir) });
}
