import { NextRequest, NextResponse } from "next/server";
import { findAgentBySlug, getIdeaActual, readIdea } from "@/lib/memoria";
import { getSystemPrompt } from "@/lib/agentes";
import { callAgentWithTools } from "@/lib/anthropic";
import type { AgentResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const agentSlugs: string[] = body?.agentSlugs || [];
  const message: string = (body?.message || "Da tu dictamen sobre la idea activa, siguiendo tu formato de respuesta.").toString();

  // FIX cuello de botella (22-sep-2026): antes, esta ruta SIEMPRE exigía y SIEMPRE inyectaba
  // memoria/ideas/IDEA-ACTUAL.md -- un único puntero global en el servidor, compartido por
  // cualquiera que use el dashboard, sin importar qué cliente estuviera eligiendo. Eso rompía
  // el trabajo multi-cliente de dos formas: (1) Acción Rápida no podía correr si no había una
  // idea activa configurada, aunque ya traía su propio contexto real (el README del cliente
  // elegido); y (2) peor -- si SÍ había una idea activa pero era de OTRO cliente/proyecto, su
  // contenido completo se colaba igual en el mensaje, mezclado con el cliente real que se
  // había elegido. `contextoIndependiente: true` es opt-in (lo manda Acción Rápida, que ya
  // arma su propio contexto completo) y evita las dos cosas -- el Chat normal, que sí depende
  // de la idea activa, sigue exactamente igual que antes (este flag nunca llega en false/ausente).
  const contextoIndependiente: boolean = body?.contextoIndependiente === true;

  if (!agentSlugs.length) {
    return NextResponse.json({ error: "Selecciona al menos un agente." }, { status: 400 });
  }

  let userMessage: string;
  let ideaInfo: { file: string; title: string; giro: string } | null = null;

  if (contextoIndependiente) {
    userMessage = message;
  } else {
    const pointer = getIdeaActual();
    if (!pointer.archivo) {
      return NextResponse.json({ error: "No hay ninguna IDEA-ACTUAL configurada." }, { status: 400 });
    }
    const idea = readIdea(pointer.archivo);
    userMessage = `## IDEA ACTIVA (memoria/ideas/${idea.file})\n\n${idea.content}\n\n---\n\n## Instrucción del usuario\n\n${message}`;
    ideaInfo = { file: idea.file, title: idea.title, giro: idea.giro };
  }

  const results: AgentResponse[] = [];

  for (const slug of agentSlugs) {
    const agent = findAgentBySlug(slug);
    if (!agent) {
      results.push({ agent: slug, ok: false, text: "Agente no encontrado." });
      continue;
    }
    try {
      const systemPrompt = getSystemPrompt(agent.slug);
      // Fase 3: tool-calling real — si el agente pide precio/costo/gastos fijos y ya los
      // tiene, calcularFinanzas se ejecuta de verdad (no lo inventa). Igual con buscarMercado
      // (hoy simulado, ver aviso en lib/tools.ts).
      const { text, toolCalls } = await callAgentWithTools(systemPrompt, userMessage);
      results.push({
        agent: agent.slug,
        ok: true,
        text,
        ...(toolCalls.length ? { herramientas: toolCalls } : {}),
      });
    } catch (err: any) {
      const msg = String(err?.message || err);
      results.push({ agent: slug, ok: false, text: msg });
    }
  }

  return NextResponse.json({ results, idea: ideaInfo });
}
