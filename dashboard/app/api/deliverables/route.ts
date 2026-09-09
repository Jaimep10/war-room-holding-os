import { NextRequest, NextResponse } from "next/server";
import {
  buildAgentSystemPrompt,
  findAgentBySlug,
  getIdeaActual,
  listDeliverables,
  readIdea,
  saveDeliverable,
} from "@/lib/memoria";
import { callAgent } from "@/lib/anthropic";
import { slugify } from "@/lib/memoria";

export async function GET() {
  const pointer = getIdeaActual();
  if (!pointer.archivo) return NextResponse.json({ files: [] });
  const files = listDeliverables(pointer.archivo);
  return NextResponse.json({ files, ideaFile: pointer.archivo });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tipo: string = (body?.tipo || "").toString();
  const agentSlug: string = (body?.agentSlug || "").toString();

  if (!tipo || !agentSlug) {
    return NextResponse.json({ error: "Faltan datos (tipo, agentSlug)." }, { status: 400 });
  }

  const pointer = getIdeaActual();
  if (!pointer.archivo) {
    return NextResponse.json({ error: "No hay ninguna IDEA-ACTUAL configurada." }, { status: 400 });
  }
  const idea = readIdea(pointer.archivo);
  const agent = findAgentBySlug(agentSlug);
  if (!agent) {
    return NextResponse.json({ error: "Agente no encontrado." }, { status: 404 });
  }

  try {
    const systemPrompt = buildAgentSystemPrompt(agent.relPath);
    const userMessage = `## IDEA ACTIVA (memoria/ideas/${idea.file})\n\n${idea.content}\n\n---\n\n## Entregable solicitado\n\nGenera el entregable "${tipo}" completo, específico para esta idea (nunca genérico ni de otro rubro), listo para usar. Devuélvelo en formato Markdown limpio, con encabezado de título.`;
    const text = await callAgent(systemPrompt, userMessage);
    const tipoSlug = slugify(tipo, 6);
    const fileName = saveDeliverable(idea.file, tipoSlug, `# ${tipo} — ${idea.title}\n\n${text}\n`);
    return NextResponse.json({ fileName });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 502 });
  }
}
