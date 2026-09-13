import {
  buildAgentSystemPrompt,
  appendResultSection,
  updateIdeaAnalysis,
} from "@/lib/memoria";
import { callAgent, extractJson } from "@/lib/anthropic";

// NUEVO (aditivo): dispara el analisis de Filtro 1 (Director de Estrategia) despues
// de que se crea una idea. Vive detras de FEATURE_AUTO_ANALYZE_FILTRO1 (ver .env.local)
// y no modifica el flujo existente cuando la flag esta apagada/ausente.
//
// No toca CORE: es un archivo nuevo, importado solo desde el POST de /api/ideas.

interface DirectorFiltro1Result {
  score_pesimista: number;
  riesgo: string;
  confianza_pesimista: number;
}

function isFeatureEnabled(): boolean {
  return process.env.FEATURE_AUTO_ANALYZE_FILTRO1 === "true";
}

export async function runFiltro1AnalysisIfEnabled(ideaFile: string, ideaContent: string): Promise<void> {
  if (!isFeatureEnabled()) {
    console.log("[director] FEATURE_AUTO_ANALYZE_FILTRO1 esta OFF - no se dispara analisis automatico.");
    return;
  }

  console.log(`[director] analizando ${ideaFile}...`);

  const systemPrompt = buildAgentSystemPrompt("director-estrategia.md");
  const userMessage = [
    `## IDEA NUEVA (memoria/ideas/${ideaFile})`,
    "",
    ideaContent,
    "",
    "---",
    "",
    "## Instrucción",
    "",
    "Esto es el Filtro 1 (Viabilidad) del Kanban del War Room: una primera lectura rápida,",
    "no la reunión completa de gerentes. Da tu lectura inicial breve (3-5 líneas) y termina",
    "SIEMPRE con un bloque ```json con exactamente estas claves:",
    "",
    "```json",
    '{"score_pesimista": <número 0-10>, "riesgo": "<una línea con el riesgo más grande>", "confianza_pesimista": <número 0-100>}',
    "```",
    "",
    "Si no tienes datos suficientes para un número real, usa tu mejor estimación explícita",
    "y dilo en el texto — nunca omitas el bloque JSON.",
  ].join("\n");

  let text: string;
  try {
    text = await callAgent(systemPrompt, userMessage);
  } catch (err: any) {
    const msg = String(err?.message || err);
    console.error(`[director] ERROR al analizar ${ideaFile}: ${msg}`);
    appendResultSection(
      ideaFile,
      "Análisis del Director de Estrategia (Filtro 1) — FALLÓ",
      `No se pudo completar el análisis automático: ${msg}`
    );
    return;
  }

  console.log(`[director] respuesta recibida para ${ideaFile}, extrayendo score...`);

  const parsed = extractJson<DirectorFiltro1Result>(text);

  appendResultSection(ideaFile, "Análisis del Director de Estrategia (Filtro 1)", text);

  if (!parsed || typeof parsed.score_pesimista !== "number") {
    console.warn(`[director] no se pudo extraer score numérico de la respuesta para ${ideaFile}.`);
    return;
  }

  updateIdeaAnalysis(ideaFile, {
    score_pesimista: parsed.score_pesimista,
    riesgo: parsed.riesgo || "Sin detalle",
    confianza_pesimista: parsed.confianza_pesimista ?? 0,
    etapa: "Filtro 2 - Estrategia",
  });

  console.log(`[director] ${ideaFile} avanzada a Filtro 2 - Estrategia (score ${parsed.score_pesimista}/10).`);
}
