import { NextRequest, NextResponse } from "next/server";
import { updateIdeaStage, readIdea } from "@/lib/memoria";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const file = (body?.file || "").toString();
  const etapa = (body?.etapa || "").toString();
  if (!file || !etapa) {
    return NextResponse.json({ error: "Faltan datos (file, etapa)." }, { status: 400 });
  }
  updateIdeaStage(file, etapa);
  const idea = readIdea(file);
  return NextResponse.json({ idea });
}
