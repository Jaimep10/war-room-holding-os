import { NextRequest, NextResponse } from "next/server";
import {
  leerEjecucion,
  solicitarBorrador,
  solicitarCompleto,
  aprobarBorrador,
  actualizarPartes,
  type Parte,
} from "@/lib/ejecucion";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cliente = searchParams.get("cliente");
  const tipoProyecto = searchParams.get("tipoProyecto");
  if (!cliente || !tipoProyecto) {
    return NextResponse.json({ error: "Faltan los parámetros cliente y tipoProyecto" }, { status: 400 });
  }
  return NextResponse.json(leerEjecucion(cliente, tipoProyecto));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cliente, tipoProyecto, accion, partes } = body as {
    cliente?: string;
    tipoProyecto?: string;
    accion?: string;
    partes?: Partial<Record<Parte, boolean>>;
  };

  if (!cliente || !tipoProyecto || !accion) {
    return NextResponse.json({ error: "Faltan cliente, tipoProyecto o accion" }, { status: 400 });
  }

  switch (accion) {
    case "solicitar-borrador":
      return NextResponse.json(solicitarBorrador(cliente, tipoProyecto));
    case "solicitar-completo":
      return NextResponse.json(solicitarCompleto(cliente, tipoProyecto));
    case "aprobar":
      return NextResponse.json(aprobarBorrador(cliente, tipoProyecto));
    case "actualizar-partes":
      return NextResponse.json(actualizarPartes(cliente, tipoProyecto, partes ?? {}));
    default:
      return NextResponse.json({ error: `accion inválida: ${accion}` }, { status: 400 });
  }
}
