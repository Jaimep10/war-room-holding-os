import { NextResponse } from "next/server";
import { listProductos } from "@/lib/clientesProductos";

export async function GET() {
  return NextResponse.json({ productos: listProductos() });
}
