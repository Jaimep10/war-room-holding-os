import { NextRequest, NextResponse } from "next/server";
import { readClienteArchivo, readClienteKitRedesArchivo } from "@/lib/clientesProductos";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const fileName = searchParams.get("file") || "";
  const kitRedes = searchParams.get("kitRedes") === "1";
  if (!slug || !fileName) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }
  try {
    const content = kitRedes
      ? readClienteKitRedesArchivo(slug, fileName)
      : readClienteArchivo(slug, fileName);
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
