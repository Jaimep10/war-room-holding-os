import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { IDEAS_DIR } from "@/lib/memoria";

/**
 * Botón "Limpiar Pantalla" del header: resetea de verdad las ideas/proyectos
 * guardados. Apunta a memoria/ideas/ (IDEAS_DIR, la misma carpeta que usa todo
 * lib/memoria.ts) -- dashboard/data/ nunca existió y no es donde vive el estado
 * real del dashboard.
 *
 * ABIERTO / sin hardcodear ningún tipo de proyecto: no filtra por prefijo de
 * archivo ni por cliente -- mueve TODO lo que haya en memoria/ideas/ (sea
 * IDEA-<n>-*.md, NEGOCIO-EXISTENTE-*.md, IDEA-CAPITAL-*.md, IDEA-ACTUAL.md,
 * indice.md, entregables/, o cualquier tipo de idea que se agregue a futuro) a
 * memoria/ideas/_borrado/<timestamp>/, en vez de borrarlo de verdad. Mismo
 * criterio de cuarentena-antes-que-rm de todo el proyecto: un click accidental
 * en un botón rojo no debe ser irreversible.
 *
 * Después de esto, listIdeas()/getIdeaActual() (lib/memoria.ts) ven una carpeta
 * vacía -- el mismo estado "recién instalado" que ya manejan sin romperse.
 */
const TRASH_DIRNAME = "_borrado";

export async function POST() {
  if (!fs.existsSync(IDEAS_DIR)) {
    return NextResponse.json({ ok: true, movidos: [], nota: "memoria/ideas todavía no existe, nada que limpiar." });
  }

  const entradas = fs.readdirSync(IDEAS_DIR).filter((f) => f !== TRASH_DIRNAME);
  if (entradas.length === 0) {
    return NextResponse.json({ ok: true, movidos: [], nota: "memoria/ideas ya está vacío." });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const trashDir = path.join(IDEAS_DIR, TRASH_DIRNAME, timestamp);
  fs.mkdirSync(trashDir, { recursive: true });

  const movidos: string[] = [];
  for (const entrada of entradas) {
    fs.renameSync(path.join(IDEAS_DIR, entrada), path.join(trashDir, entrada));
    movidos.push(entrada);
  }

  return NextResponse.json({ ok: true, movidos, trashDir: path.relative(process.cwd(), trashDir) });
}
