import { NextResponse } from "next/server";
import { buildAgentSystemPrompt, getIdeaActual, listAgents, readIdea } from "@/lib/memoria";
import { callAgent } from "@/lib/anthropic";
import type { AgentResponse } from "@/lib/types";

export async function POST() {
  const pointer = getIdeaActual();
  if (!pointer.archivo) {
    return NextResponse.json({ error: "No hay ninguna IDEA-ACTUAL configurada." }, { status: 400 });
  }
  const idea = readIdea(pointer.archivo);
  const agents = listAgents();

  const results: AgentResponse[] = [];
  for (const agent of agents) {
    try {
      const systemPrompt = buildAgentSystemPrompt(agent.relPath);
      const userMessage = `## IDEA ACTIVA (memoria/ideas/${idea.file})\n\n${idea.content}\n\n---\n\n## Instrucción del usuario\n\nEstamos en REUNIÓN DE TODO EL EQUIPO. Da tu dictamen breve sobre esta idea siguiendo tu propio formato de respuesta. Sé conciso: esto es una ronda de opiniones, no un informe extenso.`;
      const text = await callAgent(systemPrompt, userMessage);
      results.push({ agent: agent.slug, ok: true, text });
    } catch (err: any) {
      results.push({ agent: agent.slug, ok: false, text: String(err?.message || err) });
    }
  }

  return NextResponse.json({ results, idea: { file: idea.file, title: idea.title, giro: idea.giro } });
}
