import { NextRequest, NextResponse } from "next/server";
import { getIdeaActual, readIdea, setIdeaActual, listIdeas } from "@/lib/memoria";

export async function GET() {
  const pointer = getIdeaActual();
  if (!pointer.archivo) {
    return NextResponse.json({ pointer, idea: null });
  }
  try {
    const idea = readIdea(pointer.archivo);
    return NextResponse.json({ pointer, idea });
  } catch {
    return NextResponse.json({ pointer, idea: null });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const file = (body?.file || "").toString();
  const ideas = listIdeas();
  const idea = ideas.find((i) => i.file === file);
  if (!idea) {
    return NextResponse.json({ error: "Idea no encontrada." }, { status: 404 });
  }
  setIdeaActual(idea.id, idea.file, idea.giro);
  return NextResponse.json({ pointer: getIdeaActual(), idea });
}
