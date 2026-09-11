import fs from "fs";
import path from "path";
import type { ClienteSummary, ProductoSummary } from "./types";

// Igual que MEMORIA_ROOT en lib/memoria.ts: estas carpetas viven un nivel arriba del proyecto
// Next.js (/home/claude/clientes y /home/claude/producto), compartidas por toda la Oficina de
// Estrategia. El dashboard NUNCA guarda una copia propia — solo lee.
export const CLIENTES_ROOT = path.join(process.cwd(), "..", "clientes");
export const PRODUCTO_ROOT = path.join(process.cwd(), "..", "producto");

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function firstHeadingOrTitle(filePath: string, fallback: string): string {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const match = raw.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Lista cada carpeta dentro de clientes/ como un cliente aislado.
 * No mezcla datos entre clientes: cada uno se lee únicamente de su propia carpeta.
 */
export function listClientes(): ClienteSummary[] {
  if (!fs.existsSync(CLIENTES_ROOT)) return [];

  const carpetas = fs
    .readdirSync(CLIENTES_ROOT)
    .filter((f) => fs.statSync(path.join(CLIENTES_ROOT, f)).isDirectory());

  return carpetas
    .map((slug) => {
      const dir = path.join(CLIENTES_ROOT, slug);
      const archivos = fs
        .readdirSync(dir)
        .filter((f) => fs.statSync(path.join(dir, f)).isFile() && f.endsWith(".md"))
        .sort();

      const kitRedesDir = path.join(dir, "kit-redes");
      const kitRedes = fs.existsSync(kitRedesDir)
        ? fs
            .readdirSync(kitRedesDir)
            .filter((f) => f.endsWith(".md"))
            .sort()
        : [];

      const readmePath = path.join(dir, "README.md");
      const readmeRaw = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf-8") : "";
      const modoAbierto = /modo abierto/i.test(readmeRaw);

      const nombre = firstHeadingOrTitle(readmePath, titleFromSlug(slug));

      return { slug, nombre, archivos, kitRedes, modoAbierto };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Lista cada carpeta dentro de producto/ como una línea de producto propia de la agencia
 * (distinta de clientes/ — un producto no es un cliente aislado, es una oferta interna).
 */
export function listProductos(): ProductoSummary[] {
  if (!fs.existsSync(PRODUCTO_ROOT)) return [];

  const carpetas = fs
    .readdirSync(PRODUCTO_ROOT)
    .filter((f) => fs.statSync(path.join(PRODUCTO_ROOT, f)).isDirectory());

  return carpetas
    .map((slug) => {
      const dir = path.join(PRODUCTO_ROOT, slug);
      const archivos = fs
        .readdirSync(dir)
        .filter((f) => fs.statSync(path.join(dir, f)).isFile() && f.endsWith(".md"))
        .sort();
      const nombre = titleFromSlug(slug);
      return { slug, nombre, archivos };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function readClienteArchivo(slug: string, archivo: string): string {
  const dir = path.join(CLIENTES_ROOT, slug);
  const full = path.join(dir, archivo);
  const resolvedDir = path.resolve(dir);
  const resolvedFile = path.resolve(full);
  if (!resolvedFile.startsWith(resolvedDir)) throw new Error("Ruta inválida");
  return fs.readFileSync(resolvedFile, "utf-8");
}

export function readClienteKitRedesArchivo(slug: string, archivo: string): string {
  const dir = path.join(CLIENTES_ROOT, slug, "kit-redes");
  const full = path.join(dir, archivo);
  const resolvedDir = path.resolve(dir);
  const resolvedFile = path.resolve(full);
  if (!resolvedFile.startsWith(resolvedDir)) throw new Error("Ruta inválida");
  return fs.readFileSync(resolvedFile, "utf-8");
}

export function readProductoArchivo(slug: string, archivo: string): string {
  const dir = path.join(PRODUCTO_ROOT, slug);
  const full = path.join(dir, archivo);
  const resolvedDir = path.resolve(dir);
  const resolvedFile = path.resolve(full);
  if (!resolvedFile.startsWith(resolvedDir)) throw new Error("Ruta inválida");
  return fs.readFileSync(resolvedFile, "utf-8");
}
