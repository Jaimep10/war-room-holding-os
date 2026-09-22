import { NextRequest, NextResponse } from "next/server";
// Build "legacy" de pdfjs-dist: corre en Node sin DOM ni Worker real (usa su fallback
// síncrono interno cuando detecta que no hay navegador). Pineado a la rama 3.x en
// package.json porque a partir de v4 pdfjs-dist pasó a ser ESM-only, lo que complica este
// import en una ruta de API de Next 14 sin configuración extra.
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
// pdf.worker.js no trae sus propios tipos (por eso el @ts-ignore) -- solo necesitamos
// su export WorkerMessageHandler en runtime, ver explicación completa abajo.
// @ts-ignore
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.js";

// --- Fix real de "Setting up fake worker failed: Cannot find module './pdf.worker.js'" ---
// En Node, pdfjs-dist arma un "fake worker" (corre el parser en el mismo hilo en vez de un
// Worker de verdad) y, para eso, ejecuta puertas adentro `eval("require")("./pdf.worker.js")`
// -- un require RELATIVO, escrito con `eval` a propósito para que el bundler no lo toque.
// Ese require relativo se rompe cuando Next.js empaqueta esta ruta de API, porque el archivo
// compilado ya no vive al lado de pdf.worker.js dentro de node_modules.
//
// Se pidió apagar el worker con `GlobalWorkerOptions.workerSrc = null`, pero leyendo el
// código fuente de pdfjs-dist (node_modules/pdfjs-dist/legacy/build/pdf.js) esto NO alcanza:
// si workerSrc es null (o undefined, o ""), pdfjs cae en su propio fallback interno para
// Node, que es EXACTAMENTE ese mismo string relativo "./pdf.worker.js" -- mismo error.
//
// La forma que sí funciona (y es la recomendada por el propio proyecto pdfjs-dist para
// entornos empaquetados como Next.js/webpack): importar pdf.worker.js nosotros mismos con
// un `import` normal -- que Next SÍ empaqueta bien, sin trucos de eval -- y colgarlo de
// `globalThis.pdfjsWorker`. pdfjs lo detecta ahí primero (antes de intentar cualquier
// require relativo) y usa ESE módulo directamente.
(globalThis as any).pdfjsWorker = pdfjsWorker;
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = "";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_CHARS_CONTEXTO = 8000; // primeros 8000 caracteres, tal como se pidió

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
    const loadingTask = (pdfjsLib as any).getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => (typeof item.str === "string" ? item.str : "")).join(" ");
      fullText += pageText + "\n";
    }
    fullText = fullText.trim();

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
      paginas: pdf.numPages ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 502 });
  }
}
