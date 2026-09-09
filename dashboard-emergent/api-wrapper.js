"use strict";

/**
 * Puente Emergent — lee el system prompt completo de un agente de la Oficina de
 * Estrategia sin depender de Next.js ni de ninguna dependencia externa (solo
 * usa fs/path del propio Node), para que cualquier plataforma (Emergent u otra)
 * pueda invocar a los agentes.
 *
 * getAgenteSystemPrompt(agenteId) arma el prompt en este orden:
 *   1. memoria/PRINCIPIOS-DEL-EQUIPO.md   (Ley Suprema — Equipo Abierto y Generalista)
 *   2. memoria/ideas/IDEA-ACTUAL.md       (el puntero)
 *   3. el contenido COMPLETO de la idea a la que apunta ese puntero
 *      (sin esto el agente solo vería el puntero, no la idea real — se incluye
 *      porque es el propósito explícito del puntero, no un añadido opcional)
 *   4. el .md del agente (su rol + instrucción de ORO)
 *   5. el contenido de su BIBLIOTECA (los frameworks que ese agente cita entre
 *      backticks, ej. `memoria/literatura/pesimista/taleb-punto-unico-fallo.md`)
 *
 * Variables de entorno esperadas (ver .env.example en la raíz del proyecto):
 *   AGENTS_SOURCE_PATH, LITERATURA_PATH, IDEAS_PATH, PRINCIPIO_PATH
 * Todas son relativas a la raíz del proyecto (un nivel arriba de esta carpeta).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function loadDotEnvFile() {
  const envPath = path.join(ROOT, ".env");
  const env = {};
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
  return env;
}

const fileEnv = loadDotEnvFile();
function envVar(name, fallback) {
  return process.env[name] || fileEnv[name] || fallback;
}

const AGENTS_SOURCE_PATH = envVar("AGENTS_SOURCE_PATH", ".claude/agents");
const IDEAS_PATH = envVar("IDEAS_PATH", "memoria/ideas");
const PRINCIPIO_PATH = envVar("PRINCIPIO_PATH", "memoria/PRINCIPIOS-DEL-EQUIPO.md");
const SISTEMA_PATH = envVar("SISTEMA_PATH", "memoria/sistema.md");

const TONO_BRUTAL_INSTRUCCION_ACTIVA = "Activa puteada constructiva. Sin anestesia.";

/**
 * Instrucción de tono a anteponer/agregar al prompt, según el toggle
 * "Modo Amable" / "Modo Brutal (Roast Me)" del dashboard (ver src/App.tsx).
 * El fondo (score, veredicto, Informe de Autopsia de memoria/sistema.md) NUNCA
 * cambia con esto — solo cambia la forma de la respuesta.
 */
function buildTonoSuffix(tono) {
  if (tono === "amable") {
    return [
      "\n\n# TONO ACTIVO: MODO AMABLE",
      "modo_tono: amable",
      "Suaviza la forma (sin sarcasmo, sin adjetivos duros). El score, el veredicto y el Informe de",
      "Autopsia (si aplica) se mantienen EXACTAMENTE igual — no se suaviza el fondo, solo la frase.",
    ].join("\n");
  }
  return ["\n\n# TONO ACTIVO: MODO BRUTAL (ROAST ME)", "modo_tono: brutal", TONO_BRUTAL_INSTRUCCION_ACTIVA].join(
    "\n"
  );
}

const manifest = require("./agents-manifest.json");

/** IDs de los 13 agentes core a los que aplica memoria/sistema.md (excluye sub-agentes de marketing). */
const AGENTES_CORE_IDS = (manifest.agentes || []).map((a) => a.id);

function readIfExists(absPath) {
  return fs.existsSync(absPath) ? fs.readFileSync(absPath, "utf-8") : "";
}

/** Quita el bloque YAML `--- ... ---` inicial de un agente, sin depender de gray-matter. */
function stripFrontmatter(raw) {
  const match = raw.match(/^---\s*[\s\S]*?---\s*/);
  return match ? raw.slice(match[0].length) : raw;
}

/** Extrae las rutas `memoria/literatura/...md` citadas en la sección BIBLIOTECA del agente. */
function extractBibliotecaPaths(agentBody) {
  const found = new Set();
  const regex = /`(memoria\/literatura\/[^`]+\.md)`/g;
  let m;
  while ((m = regex.exec(agentBody))) found.add(m[1]);
  return Array.from(found);
}

/** Busca la definición del agente en el manifiesto (agentes + sub-agentes de marketing). */
function resolveAgentFile(agenteId) {
  const todos = [...(manifest.agentes || []), ...(manifest.sub_agentes_marketing_extendidos || [])];
  const entry = todos.find((a) => a.id === agenteId);
  if (entry) return path.join(ROOT, entry.archivo);

  // Fallback si no está en el manifiesto: intenta adivinar el archivo directamente.
  const candidatos = [
    path.join(ROOT, AGENTS_SOURCE_PATH, `${agenteId}.md`),
    path.join(ROOT, AGENTS_SOURCE_PATH, `agente-${agenteId}.md`),
    path.join(ROOT, AGENTS_SOURCE_PATH, "marketing", `${agenteId}.md`),
  ];
  return candidatos.find((c) => fs.existsSync(c)) || null;
}

function getIdeaActualPointer() {
  const punteroPath = path.join(ROOT, IDEAS_PATH, "IDEA-ACTUAL.md");
  const raw = readIfExists(punteroPath);
  const fileMatch = raw.match(/ARCHIVO:\s*(?:memoria\/ideas\/)?(\S+\.md)/);
  return { raw, archivo: fileMatch ? fileMatch[1] : null };
}

/**
 * Devuelve el system prompt completo y listo para enviar a un LLM para el
 * agente `agenteId` (ej. "pesimista", "finanzas", "director", "marketing-copywriting").
 * Lanza un error si el agente no existe ni en el manifiesto ni por convención de nombres.
 *
 * @param {string} agenteId
 * @param {"amable"|"brutal"} [tono="brutal"] Tono del toggle del dashboard (ver src/App.tsx).
 *   "brutal" es el default porque es el default de memoria/sistema.md. El fondo (score,
 *   veredicto, Informe de Autopsia) nunca cambia con el tono — solo la forma de la respuesta.
 */
function getAgenteSystemPrompt(agenteId, tono = "brutal") {
  const principios = readIfExists(path.join(ROOT, PRINCIPIO_PATH));

  const agentFile = resolveAgentFile(agenteId);
  if (!agentFile) {
    throw new Error(
      `Agente "${agenteId}" no encontrado en dashboard-emergent/agents-manifest.json ni en ${AGENTS_SOURCE_PATH}.`
    );
  }
  const agentBody = stripFrontmatter(fs.readFileSync(agentFile, "utf-8")).trim();

  const esCore = AGENTES_CORE_IDS.includes(agenteId);
  const sistema = esCore ? readIfExists(path.join(ROOT, SISTEMA_PATH)) : "";

  const { raw: punteroRaw, archivo: ideaFile } = getIdeaActualPointer();
  const ideaContent = ideaFile ? readIfExists(path.join(ROOT, IDEAS_PATH, ideaFile)) : "";

  const bibliotecaContent = extractBibliotecaPaths(agentBody)
    .map((p) => {
      const full = path.join(ROOT, p);
      return fs.existsSync(full) ? `\n\n### 📖 ${p}\n\n${fs.readFileSync(full, "utf-8")}` : "";
    })
    .join("");

  return [
    "# LEY SUPREMA DEL EQUIPO (memoria/PRINCIPIOS-DEL-EQUIPO.md)",
    principios || "_(no se encontró PRINCIPIOS-DEL-EQUIPO.md)_",
    esCore
      ? `\n\n# PERSONALIDAD BASE (memoria/sistema.md)\n\n${sistema || "_(no se encontró sistema.md)_"}`
      : "",
    "\n\n# PUNTERO DE IDEA ACTUAL (memoria/ideas/IDEA-ACTUAL.md)",
    punteroRaw || "_(no existe IDEA-ACTUAL.md todavía)_",
    ideaFile
      ? `\n\n# CONTENIDO COMPLETO DE LA IDEA ACTIVA (${ideaFile})\n\n${ideaContent}`
      : "\n\n_(No hay ninguna idea activa — el agente debe preguntar sobre qué idea trabajar antes de responder.)_",
    `\n\n# DEFINICIÓN DEL AGENTE (${agenteId})`,
    agentBody,
    bibliotecaContent ? `\n\n# BIBLIOTECA DEL AGENTE${bibliotecaContent}` : "",
    esCore ? buildTonoSuffix(tono === "amable" ? "amable" : "brutal") : "",
  ].join("\n");
}

module.exports = {
  getAgenteSystemPrompt,
  resolveAgentFile,
  buildTonoSuffix,
  AGENTES_CORE_IDS,
  manifest,
  ROOT,
};

// Auto-prueba: `node dashboard-emergent/api-wrapper.js pesimista brutal`
//              `node dashboard-emergent/api-wrapper.js pesimista amable`
if (require.main === module) {
  const id = process.argv[2] || "pesimista";
  const tono = process.argv[3] === "amable" ? "amable" : "brutal";
  try {
    const prompt = getAgenteSystemPrompt(id, tono);
    console.log(`--- system prompt para "${id}" [tono: ${tono}] (${prompt.length} caracteres) ---\n`);
    console.log(prompt.slice(0, 1200) + (prompt.length > 1200 ? "\n... (truncado)" : ""));
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}
