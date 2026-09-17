import { NextRequest, NextResponse } from "next/server";
import { createIdea, listIdeas } from "@/lib/memoria";
import { runFiltro1AnalysisIfEnabled } from "@/lib/analisisEquipo";

export async function GET() {
  return NextResponse.json({ ideas: listIdeas() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const descripcion = (body?.descripcion || "").toString().trim();
  if (!descripcion) {
    return NextResponse.json({ error: "Falta la descripción de la idea." }, { status: 400 });
  }
  const idea = createIdea(descripcion);

  // NUEVO (aditivo, detrás de feature flag OFF por defecto — ver .env.local):
  // dispara el análisis del Director de Estrategia para Filtro 1. Si la flag
  // está apagada o ausente, esta llamada es un no-op inmediato (ver lib/analisisEquipo.ts).
  await runFiltro1AnalysisIfEnabled(idea.file, idea.content);

  return NextResponse.json({ idea });
}
