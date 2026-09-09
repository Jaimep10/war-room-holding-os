import { NextRequest, NextResponse } from "next/server";
import { createIdea, listIdeas } from "@/lib/memoria";

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
  return NextResponse.json({ idea });
}
