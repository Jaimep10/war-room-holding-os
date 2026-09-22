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
import { createCanvas } from "@napi-rs/canvas";
import { callVision } from "@/lib/anthropic";

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

// --- Fallback a visión AI cuando el PDF no tiene texto real (son fotos/escaneos) ---
// pdfjs-dist, en Node, por defecto usa una NodeCanvasFactory que hace `require("canvas")`
// puertas adentro para poder renderizar páginas a imagen (page.render) -- y ese paquete
// "canvas" está instalado pero con el binario nativo roto en este entorno (mismo tipo de
// problema que el del worker: falta 'build/Release/canvas.node'). En vez de pelear con esa
// compilación nativa, le pasamos a pdfjs nuestra PROPIA fábrica de canvas basada en
// "@napi-rs/canvas" (trae binarios precompilados, no necesita compilar nada) -- pdfjs solo
// necesita un objeto con create/reset/destroy, no exige que sea el paquete "canvas" en sí.
class NapiCanvasFactory {
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) throw new Error("Tamaño de canvas inválido");
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(canvasAndContext: { canvas: any }, width: number, height: number) {
    if (!canvasAndContext.canvas) throw new Error("Canvas no especificado");
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext: { canvas: any; context: any }) {
    if (!canvasAndContext.canvas) throw new Error("Canvas no especificado");
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_CHARS_CONTEXTO = 8000; // primeros 8000 caracteres, tal como se pidió
const MAX_PAGINAS_VISION = 5; // cuántas páginas como máximo se mandan a visión (costo/tiempo)
const MAX_LADO_PX = 1600; // lado más largo de cada imagen mandada a visión, para no pasarse de payload

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

    let viaVision = false;
    let paginasProcesadas: number | null = null;

    if (!fullText) {
      // Sin texto real en la capa de texto del PDF -- probablemente son fotos/escaneos
      // (justo el caso reportado). En vez de rendirnos con "no se pudo extraer texto",
      // renderizamos las páginas a imagen y se las mandamos a visión AI (el mismo modelo
      // Claude que ya usan los agentes) para que las describa/transcriba.
      try {
        const canvasFactory = new NapiCanvasFactory();
        const totalAProcesar = Math.min(pdf.numPages, MAX_PAGINAS_VISION);
        const imagenes: { mediaType: "image/png"; base64: string }[] = [];

        for (let i = 1; i <= totalAProcesar; i++) {
          const page = await pdf.getPage(i);
          const viewportBase = page.getViewport({ scale: 1 });
          const scale = Math.min(2, MAX_LADO_PX / Math.max(viewportBase.width, viewportBase.height));
          const viewport = page.getViewport({ scale: Math.max(scale, 0.1) });

          const canvasAndContext = canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
          await page.render({
            canvasContext: canvasAndContext.context,
            viewport,
            canvasFactory,
          }).promise;

          const png: Buffer = canvasAndContext.canvas.toBuffer("image/png");
          imagenes.push({ mediaType: "image/png", base64: png.toString("base64") });
          canvasFactory.destroy(canvasAndContext);
        }

        const instruccion = [
          `Este PDF no tiene texto extraíble (son fotos o un escaneo) -- son ${pdf.numPages} página(s), acá tenés las primeras ${imagenes.length}.`,
          "Describí y transcribí TODO lo que se ve en cada imagen, en español: si hay texto (aunque sea manuscrito o en una foto), transcribilo tal cual; si son fotos de un lugar/producto/persona, describí en detalle lo relevante para un negocio (qué se ve, estado, contexto).",
          "Organizá tu respuesta por página, con un encabezado tipo '## Página N' para cada una. No inventes datos que no se vean en la imagen -- si algo no se distingue bien, decilo en vez de adivinar.",
        ].join("\n\n");

        const descripcion = await callVision(imagenes, instruccion);

        if (descripcion.trim()) {
          fullText = descripcion.trim();
          viaVision = true;
          paginasProcesadas = imagenes.length;
        }
      } catch (visionErr: any) {
        const msg = String(visionErr?.message || visionErr);
        if (msg.startsWith("MISSING_API_KEY")) {
          return NextResponse.json(
            {
              error:
                "Ese PDF no tiene texto real (son fotos/escaneo) -- para leerlo hace falta mandarlo a visión AI, y no hay ANTHROPIC_API_KEY configurada en dashboard/.env.local. Configurala y probá de nuevo.",
            },
            { status: 424 }
          );
        }
        return NextResponse.json(
          { error: `No se pudo generar ni analizar imágenes de las páginas del PDF: ${msg}` },
          { status: 502 }
        );
      }
    }

    if (!fullText) {
      return NextResponse.json(
        {
          error:
            "No se pudo extraer texto de ese PDF ni describirlo por visión AI (¿está vacío o corrupto?).",
        },
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
      // Transparencia (Motor de Contexto): si esto es true, `text` NO es texto real del PDF,
      // es lo que describió/transcribió el modelo mirando las imágenes de las páginas.
      viaVision,
      ...(paginasProcesadas !== null ? { paginasProcesadas } : {}),
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 502 });
  }
}
