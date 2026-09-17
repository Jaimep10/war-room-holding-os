import { NextRequest, NextResponse } from "next/server";
import { crearExcel } from "@/lib/excelTools";

// Genera un .xlsx real (fórmulas de Excel, no valores fijos) y lo devuelve como descarga.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const precio = Number(body?.precio);
  const costo = Number(body?.costo);
  const unidadesMes = Number(body?.unidadesMes);
  const gastosFijos = Number(body?.gastosFijos) || 0;

  if (!Number.isFinite(precio) || !Number.isFinite(costo) || !Number.isFinite(unidadesMes)) {
    return NextResponse.json({ error: "Faltan precio, costo o unidadesMes (deben ser números)." }, { status: 400 });
  }
  if (precio <= costo) {
    return NextResponse.json(
      { error: "El precio debe ser mayor al costo — si no, no hay margen que calcular." },
      { status: 400 }
    );
  }

  try {
    const buffer = await crearExcel({
      nombreHoja: "Cotización",
      finanzas: { precio, costo, unidadesMes, gastosFijos },
    });
    const fecha = new Date().toISOString().slice(0, 10);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="WarRoom-cotizacion-${fecha}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 502 });
  }
}
