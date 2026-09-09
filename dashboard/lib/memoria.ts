import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { AgentSummary, IdeaActualPointer, IdeaFull, IdeaSummary } from "./types";

// La raíz de "memoria" vive un nivel arriba de este proyecto Next.js (/home/claude/memoria),
// compartida por toda la Oficina de Estrategia — el dashboard NUNCA guarda una copia propia.
export const MEMORIA_ROOT = path.join(process.cwd(), "..", "memoria");
export const IDEAS_DIR = path.join(MEMORIA_ROOT, "ideas");
export const ENTREGABLES_DIR = path.join(IDEAS_DIR, "entregables");
export const AGENTS_ROOT = path.join(process.cwd(), "..", ".claude", "agents");
export const PRINCIPIOS_PATH = path.join(MEMORIA_ROOT, "PRINCIPIOS-DEL-EQUIPO.md");
export const IDEA_ACTUAL_PATH = path.join(IDEAS_DIR, "IDEA-ACTUAL.md");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function slugify(text: string, maxWords = 5): string {
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, maxWords);
  return words.join("-") || "idea-sin-nombre";
}

function firstHeading(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Idea sin título";
}

function parseIdeaFile(file: string): IdeaFull {
  const full = path.join(IDEAS_DIR, file);
  const raw = fs.readFileSync(full, "utf-8");
  const parsed = matter(raw);
  const idMatch = file.match(/^(IDEA-\d+)/);
  return {
    file,
    id: idMatch ? idMatch[1] : file.replace(/\.md$/, ""),
    title: firstHeading(parsed.content).replace(/^IDEA-\d+:\s*/, ""),
    giro: (parsed.data.giro as string) || "Por definir",
    etapa: (parsed.data.etapa as string) || "Filtro 1 - Viabilidad",
    score: typeof parsed.data.score_pesimista === "number" ? parsed.data.score_pesimista : null,
    riesgo: (parsed.data.riesgo as string) || null,
    confianza: typeof parsed.data.confianza_pesimista === "number" ? parsed.data.confianza_pesimista : null,
    content: raw,
  };
}

export function listIdeas(): IdeaSummary[] {
  ensureDir(IDEAS_DIR);
  const files = fs
    .readdirSync(IDEAS_DIR)
    .filter((f) => /^IDEA-\d+-.*\.md$/.test(f));
  return files
    .map(parseIdeaFile)
    .sort((a, b) => {
      const na = parseInt(a.id.replace("IDEA-", ""), 10);
      const nb = parseInt(b.id.replace("IDEA-", ""), 10);
      return na - nb;
    });
}

export function readIdea(file: string): IdeaFull {
  return parseIdeaFile(file);
}

export function getIdeaActual(): IdeaActualPointer {
  if (!fs.existsSync(IDEA_ACTUAL_PATH)) {
    return { ideaId: null, archivo: null, rubro: null };
  }
  const raw = fs.readFileSync(IDEA_ACTUAL_PATH, "utf-8");
  const idMatch = raw.match(/IDEA_ACTUAL:\s*(\S+)/);
  const fileMatch = raw.match(/ARCHIVO:\s*memoria\/ideas\/(\S+\.md)/);
  const rubroMatch = raw.match(/RUBRO:\s*(.+)/);
  return {
    ideaId: idMatch ? idMatch[1] : null,
    archivo: fileMatch ? fileMatch[1] : null,
    rubro: rubroMatch ? rubroMatch[1].trim() : null,
  };
}

export function setIdeaActual(ideaId: string, archivo: string, rubro: string) {
  const content = `# Puntero de Idea Activa

Este archivo le dice a TODOS los agentes de la Oficina de Estrategia sobre qué idea del portafolio están trabajando en este momento. Los agentes son generalistas: no saben de qué rubro es el negocio hasta que leen este puntero.

Para cambiar de idea activa, edita SOLO este archivo (o usa el selector del dashboard). No hay que tocar ningún agente.

---

IDEA_ACTUAL: ${ideaId}
ARCHIVO: memoria/ideas/${archivo}
RUBRO: ${rubro}
`;
  fs.writeFileSync(IDEA_ACTUAL_PATH, content, "utf-8");
}

export function updateIdeaStage(file: string, etapa: string) {
  const full = path.join(IDEAS_DIR, file);
  const raw = fs.readFileSync(full, "utf-8");
  const parsed = matter(raw);
  parsed.data.etapa = etapa;
  const rebuilt = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(full, rebuilt, "utf-8");
}

function nextIdeaNumber(): number {
  const files = fs.existsSync(IDEAS_DIR)
    ? fs.readdirSync(IDEAS_DIR).filter((f) => /^IDEA-\d+-.*\.md$/.test(f))
    : [];
  const numbers = files.map((f) => {
    const m = f.match(/^IDEA-(\d+)-/);
    return m ? parseInt(m[1], 10) : 0;
  });
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

export function createIdea(descripcion: string): IdeaFull {
  ensureDir(IDEAS_DIR);
  const n = nextIdeaNumber();
  const ideaId = `IDEA-${n}`;
  const slug = slugify(descripcion, 5);
  const file = `${ideaId}-${slug}.md`;
  const tituloCorto = descripcion.split(/\n/)[0].slice(0, 90);

  const frontmatter = {
    giro: "Por definir (pendiente de análisis del Director)",
    etapa: "Filtro 1 - Viabilidad",
  };

  const body = `# ${ideaId}: ${tituloCorto}

**Descripción original del usuario:**

${descripcion}

**Estado:** Recién ingresada al portafolio. Pendiente: Canvas, Estrategia, Plan de Acción, Análisis de Riesgo, Financiero, de Mercado y de Marketing.
**Registrada:** ${new Date().toISOString().slice(0, 10)}

---

## 1. Canvas (Business Model Canvas)

_Pendiente — pídele al Director de Estrategia que lo complete._

## 2. Estrategia (Porter + Océano Azul)

_Pendiente._

## 3. Plan de Acción

_Pendiente._

## 4. Análisis de Riesgo (Agente Pesimista)

_Pendiente._
`;

  const content = matter.stringify(body, frontmatter);
  fs.writeFileSync(path.join(IDEAS_DIR, file), content, "utf-8");

  setIdeaActual(ideaId, file, frontmatter.giro);
  refreshIndice();

  return parseIdeaFile(file);
}

function refreshIndice() {
  const ideas = listIdeas();
  const rows = ideas
    .map(
      (i) =>
        `| ${i.id} | ${i.title} | \`${i.file}\` | ${i.etapa} | ${new Date().toISOString().slice(0, 10)} |`
    )
    .join("\n");
  const content = `# Índice de Ideas — Portafolio de Negocios

| ID | Nombre corto | Archivo | Estado | Última actualización |
|----|--------------|---------|--------|-----------------------|
${rows}

---

## Convención de memoria

Cada idea vive en **un solo archivo**: \`memoria/ideas/IDEA-[numero]-[nombre-corto].md\`, con secciones internas (Canvas, Estrategia, Plan de Acción, Análisis de Riesgo, Financiero, Mercado, Marketing) que cada agente va completando conforme trabaja la idea.

\`memoria/ideas/IDEA-ACTUAL.md\` es el **puntero** a la idea activa. Los agentes de \`.claude/agents/\` son generalistas: leen ese puntero, abren el archivo de la idea que señala, y aplican su marco a lo que encuentren ahí.

Este índice se regenera automáticamente desde el dashboard cada vez que se crea una idea nueva.
`;
  fs.writeFileSync(path.join(IDEAS_DIR, "indice.md"), content, "utf-8");
}

// ---------- Modo 2: Capital -> Idea ----------

export interface CapitalInputs {
  capital: number;
  ciudad: string;
  horasSemana: number;
  habilidades: string;
  retorno: string;
}

export function createCapitalIdea(inputs: CapitalInputs): { file: string; ideaId: string } {
  ensureDir(IDEAS_DIR);
  const montoSlug = Math.round(inputs.capital).toString();
  let file = `IDEA-CAPITAL-${montoSlug}.md`;
  let n = 2;
  while (fs.existsSync(path.join(IDEAS_DIR, file))) {
    file = `IDEA-CAPITAL-${montoSlug}-${n}.md`;
    n++;
  }
  const ideaId = `IDEA-CAPITAL-${montoSlug}`;
  const frontmatter = {
    modo: "capital-idea",
    giro: "Por definir (el equipo va a proponer 10 ideas)",
    etapa: "Filtro 1 - Viabilidad",
    capital: inputs.capital,
    ciudad: inputs.ciudad,
    horas_semana: inputs.horasSemana,
    retorno_deseado: inputs.retorno,
  };
  const body = `# ${ideaId}: De Capital a Idea de Negocio

**Modo:** Capital → Idea (Modo 2)

## Insumos del usuario

- **Capital disponible:** $${inputs.capital}
- **Ciudad:** ${inputs.ciudad}
- **Horas por semana disponibles:** ${inputs.horasSemana}
- **Habilidades / activos:** ${inputs.habilidades}
- **Retorno deseado:** ${inputs.retorno}

**Estado:** Pendiente de reunión de 4 agentes (Analista + Finanzas + Compras + Pesimista) para proponer 10 ideas comparables.
**Registrada:** ${new Date().toISOString().slice(0, 10)}
`;
  const content = matter.stringify(body, frontmatter);
  fs.writeFileSync(path.join(IDEAS_DIR, file), content, "utf-8");
  setIdeaActual(ideaId, file, frontmatter.giro);
  return { file, ideaId };
}

export function appendResultSection(file: string, heading: string, markdownContent: string) {
  const full = path.join(IDEAS_DIR, file);
  const raw = fs.readFileSync(full, "utf-8");
  const appended = `${raw}\n\n---\n\n## ${heading}\n\n${markdownContent}\n`;
  fs.writeFileSync(full, appended, "utf-8");
}

// ---------- Modo 3: Mejorar Negocio Existente ----------

export interface NegocioInputs {
  nombre: string;
  giro: string;
  facturacion: number;
  margen: number;
  empleados: number;
  dolor: string;
}

export function createNegocioExistente(inputs: NegocioInputs): { file: string; ideaId: string } {
  ensureDir(IDEAS_DIR);
  const slug = slugify(inputs.nombre, 5);
  let file = `NEGOCIO-EXISTENTE-${slug}.md`;
  let n = 2;
  while (fs.existsSync(path.join(IDEAS_DIR, file))) {
    file = `NEGOCIO-EXISTENTE-${slug}-${n}.md`;
    n++;
  }
  const ideaId = `NEGOCIO-EXISTENTE-${slug.toUpperCase()}`;
  const frontmatter = {
    modo: "negocio-existente",
    giro: inputs.giro,
    etapa: "Filtro 1 - Viabilidad",
    facturacion_mensual: inputs.facturacion,
    margen_actual_pct: inputs.margen,
    empleados: inputs.empleados,
    principal_dolor: inputs.dolor,
  };
  const body = `# ${ideaId}: Diagnóstico de Mejora — ${inputs.nombre}

**Modo:** Mejorar Negocio Existente (Modo 3)

## Insumos del usuario

- **Nombre del negocio:** ${inputs.nombre}
- **Giro:** ${inputs.giro}
- **Facturación mensual actual:** $${inputs.facturacion}
- **Margen actual:** ${inputs.margen}%
- **Número de empleados:** ${inputs.empleados}
- **Principal dolor declarado:** ${inputs.dolor}

**Estado:** Pendiente de reunión de 7 agentes (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal) para el diagnóstico de Fugas, Palancas y Plan 90 Días.
**Registrada:** ${new Date().toISOString().slice(0, 10)}
`;
  const content = matter.stringify(body, frontmatter);
  fs.writeFileSync(path.join(IDEAS_DIR, file), content, "utf-8");
  setIdeaActual(ideaId, file, frontmatter.giro);
  return { file, ideaId };
}

// ---------- Prompt combinado para varios agentes a la vez ----------

export function buildCombinedSystemPrompt(agentSlugs: string[]): string {
  const principios = fs.existsSync(PRINCIPIOS_PATH) ? fs.readFileSync(PRINCIPIOS_PATH, "utf-8") : "";
  const seenLiteratura = new Set<string>();
  const parts: string[] = [
    "# LEY SUPREMA DEL EQUIPO (léela primero, aplica por encima de todo lo demás)",
    principios,
    "\n\n# ERES UNA REUNIÓN DE VARIOS ESPECIALISTAS EN UNA SOLA VOZ",
    "A continuación tienes la definición de rol y la biblioteca de cada especialista que participa en esta reunión. Debes razonar internamente aplicando el marco de CADA UNO antes de responder, como si fuera una mesa redonda — pero al final entregas un solo resultado consolidado, en el formato exacto que te pida la instrucción del usuario (normalmente JSON estricto).",
  ];

  for (const slug of agentSlugs) {
    const agent = findAgentBySlug(slug);
    if (!agent) continue;
    const agentFull = path.join(AGENTS_ROOT, agent.relPath);
    const raw = fs.readFileSync(agentFull, "utf-8");
    const parsed = matter(raw);
    parts.push(`\n\n---\n\n# ESPECIALISTA: ${slug}\n\n${parsed.content.trim()}`);
    for (const p of extractBiblioteca(parsed.content)) {
      if (seenLiteratura.has(p)) continue;
      seenLiteratura.add(p);
      const litFull = path.join(process.cwd(), "..", p);
      if (fs.existsSync(litFull)) {
        parts.push(`\n\n### 📖 ${p}\n\n${fs.readFileSync(litFull, "utf-8")}`);
      }
    }
  }

  return parts.join("\n");
}

// ---------- Agentes ----------

function parseAgentFile(root: string, relFolder: string, file: string): AgentSummary {
  const full = path.join(root, relFolder, file);
  const raw = fs.readFileSync(full, "utf-8");
  const parsed = matter(raw);
  const slug = (parsed.data.name as string) || file.replace(/\.md$/, "");
  return {
    slug,
    name: slug,
    description: (parsed.data.description as string) || "",
    group: relFolder === "marketing" ? "marketing" : "principal",
    relPath: path.join(relFolder, file),
  };
}

export function listAgents(): AgentSummary[] {
  const result: AgentSummary[] = [];
  if (fs.existsSync(AGENTS_ROOT)) {
    for (const f of fs.readdirSync(AGENTS_ROOT)) {
      const full = path.join(AGENTS_ROOT, f);
      if (fs.statSync(full).isFile() && f.endsWith(".md")) {
        result.push(parseAgentFile(AGENTS_ROOT, "", f));
      }
    }
    const marketingDir = path.join(AGENTS_ROOT, "marketing");
    if (fs.existsSync(marketingDir)) {
      for (const f of fs.readdirSync(marketingDir)) {
        if (f.endsWith(".md")) {
          result.push(parseAgentFile(AGENTS_ROOT, "marketing", f));
        }
      }
    }
  }
  return result.sort((a, b) => a.slug.localeCompare(b.slug));
}

function extractBiblioteca(agentBody: string): string[] {
  const paths = new Set<string>();
  const matches = agentBody.matchAll(/`(memoria\/literatura\/[^`]+\.md)`/g);
  for (const m of matches) paths.add(m[1]);
  return Array.from(paths);
}

export function buildAgentSystemPrompt(agentRelPath: string): string {
  const agentFull = path.join(AGENTS_ROOT, agentRelPath);
  const raw = fs.readFileSync(agentFull, "utf-8");
  const parsed = matter(raw);
  const agentBody = parsed.content.trim();

  const principios = fs.existsSync(PRINCIPIOS_PATH)
    ? fs.readFileSync(PRINCIPIOS_PATH, "utf-8")
    : "";

  const bibliotecaPaths = extractBiblioteca(agentBody);
  const bibliotecaContent = bibliotecaPaths
    .map((p) => {
      const full = path.join(process.cwd(), "..", p);
      if (fs.existsSync(full)) {
        return `\n\n### 📖 ${p}\n\n${fs.readFileSync(full, "utf-8")}`;
      }
      return "";
    })
    .join("");

  return [
    "# LEY SUPREMA DEL EQUIPO (léela primero, aplica por encima de todo lo demás)",
    principios,
    "\n\n# TU DEFINICIÓN DE ROL",
    agentBody,
    "\n\n# TU BIBLIOTECA (contenido completo de los frameworks que debes aplicar)",
    bibliotecaContent || "_(sin archivos de biblioteca detectados)_",
  ].join("\n");
}

export function findAgentBySlug(slug: string): AgentSummary | undefined {
  return listAgents().find((a) => a.slug === slug);
}

// ---------- Entregables ----------

export function ideaSlugFolder(ideaFile: string): string {
  return ideaFile.replace(/\.md$/, "");
}

export function listDeliverables(ideaFile: string): string[] {
  const dir = path.join(ENTREGABLES_DIR, ideaSlugFolder(ideaFile));
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

export function saveDeliverable(ideaFile: string, tipoSlug: string, content: string): string {
  const dir = path.join(ENTREGABLES_DIR, ideaSlugFolder(ideaFile));
  ensureDir(dir);
  const fileName = `${tipoSlug}.md`;
  fs.writeFileSync(path.join(dir, fileName), content, "utf-8");
  return fileName;
}

export function readDeliverable(ideaFile: string, fileName: string): string {
  const dir = path.join(ENTREGABLES_DIR, ideaSlugFolder(ideaFile));
  const full = path.join(dir, fileName);
  const resolvedDir = path.resolve(dir);
  const resolvedFile = path.resolve(full);
  if (!resolvedFile.startsWith(resolvedDir)) {
    throw new Error("Ruta inválida");
  }
  return fs.readFileSync(resolvedFile, "utf-8");
}
