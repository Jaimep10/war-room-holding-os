import { NextRequest, NextResponse } from "next/server";
import { getIdeaActual, readDeliverable } from "@/lib/memoria";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("file") || "";
  const pointer = getIdeaActual();
  if (!pointer.archivo || !fileName) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }
  try {
    const content = readDeliverable(pointer.archivo, fileName);
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 404 });
  }
}
