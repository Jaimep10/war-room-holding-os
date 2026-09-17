import { NextRequest, NextResponse } from "next/server";
import { exportarFinanzasExcel } from "@/lib/excelTools";

// Excel financiero completo: Punto de Equilibrio + P&G Mensual + Flujo 12 Meses, con
// fórmulas encadenadas entre hojas (ver lib/excelTools.ts).
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
  const crecimientoMensualPct = Number(body?.crecimientoMensualPct) || 0;

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
    const buffer = await exportarFinanzasExcel({ precio, costo, unidadesMes, gastosFijos, crecimientoMensualPct });
    const fecha = new Date().toISOString().slice(0, 10);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="WarRoom-financiero-completo-${fecha}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 502 });
  }
}
