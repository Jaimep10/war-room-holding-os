import { NextResponse } from "next/server";
import { getProyectosMuebles } from "@/lib/proyectos";

export async function GET() {
  const proyectos = getProyectosMuebles();
  return NextResponse.json({ proyectos });
}
