import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

// Fuerza runtime Node.js (pdf-parse necesita Buffer/fs, no corre en Edge).
export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_CHARS_CONTEXTO = 40000; // límite razonable para no reventar el prompt del agente

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo enviado." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El PDF pesa más de 15MB. Sube un archivo más liviano." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = await pdfParse(buffer);
    const fullText = (parsed.text || "").trim();

    if (!fullText) {
      return NextResponse.json(
        { error: "No se pudo extraer texto de ese PDF (¿es un escaneo sin OCR?)." },
        { status: 422 }
      );
    }

    const truncated = fullText.length > MAX_CHARS_CONTEXTO;
    const text = truncated ? fullText.slice(0, MAX_CHARS_CONTEXTO) : fullText;
    const title = file.name.replace(/\.pdf$/i, "");

    return NextResponse.json({
      title,
      text,
      truncated,
      originalChars: fullText.length,
      paginas: parsed.numpages ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 502 });
  }
}
