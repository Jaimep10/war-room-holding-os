import { NextRequest, NextResponse } from "next/server";
import { buildAgentSystemPrompt, findAgentBySlug, getIdeaActual, readIdea } from "@/lib/memoria";
import { callAgent } from "@/lib/anthropic";
import type { AgentResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const agentSlugs: string[] = body?.agentSlugs || [];
  const message: string = (body?.message || "Da tu dictamen sobre la idea activa, siguiendo tu formato de respuesta.").toString();

  if (!agentSlugs.length) {
    return NextResponse.json({ error: "Selecciona al menos un agente." }, { status: 400 });
  }

  const pointer = getIdeaActual();
  if (!pointer.archivo) {
    return NextResponse.json({ error: "No hay ninguna IDEA-ACTUAL configurada." }, { status: 400 });
  }
  const idea = readIdea(pointer.archivo);

  const results: AgentResponse[] = [];

  for (const slug of agentSlugs) {
    const agent = findAgentBySlug(slug);
    if (!agent) {
      results.push({ agent: slug, ok: false, text: "Agente no encontrado." });
      continue;
    }
    try {
      const systemPrompt = buildAgentSystemPrompt(agent.relPath);
      const userMessage = `## IDEA ACTIVA (memoria/ideas/${idea.file})\n\n${idea.content}\n\n---\n\n## Instrucción del usuario\n\n${message}`;
      const text = await callAgent(systemPrompt, userMessage);
      results.push({ agent: agent.slug, ok: true, text });
    } catch (err: any) {
      const msg = String(err?.message || err);
      results.push({ agent: agent.slug, ok: false, text: msg });
    }
  }

  return NextResponse.json({ results, idea: { file: idea.file, title: idea.title, giro: idea.giro } });
}
