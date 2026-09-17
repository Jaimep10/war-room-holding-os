import { NextRequest, NextResponse } from "next/server";
import { leerExcel, leerCsv } from "@/lib/excelTools";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;

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

  const name = file.name.toLowerCase();
  const isCsv = name.endsWith(".csv");
  const isExcel = /\.(xlsx|xlsm|xls)$/i.test(name);
  if (!isCsv && !isExcel) {
    return NextResponse.json({ error: "Solo se aceptan archivos Excel (.xlsx/.xlsm/.xls) o .csv." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El archivo pesa más de 15MB." }, { status: 400 });
  }

  try {
    let result: { hojas: Awaited<ReturnType<typeof leerExcel>>["hojas"] };
    if (isCsv) {
      const texto = await file.text();
      result = leerCsv(texto, file.name);
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());
      result = await leerExcel(buffer);
    }

    if (!result.hojas.length) {
      return NextResponse.json({ error: "No se encontraron hojas/datos en el archivo." }, { status: 422 });
    }

    return NextResponse.json({ archivo: file.name, hojas: result.hojas });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 502 });
  }
}
