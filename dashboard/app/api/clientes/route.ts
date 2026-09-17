import { NextResponse } from "next/server";
import { listClientes } from "@/lib/clientesProductos";

export async function GET() {
  return NextResponse.json({ clientes: listClientes() });
}
