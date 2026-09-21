import { NextResponse } from "next/server";
import { verificarAntiClon } from "@/lib/agentes";

/**
 * Chequeo real de que ningún agente terminó con el systemPrompt de otro
 * (ver lib/agentes.ts). GET porque no muta nada -- solo arma los prompts en
 * memoria y compara. Útil para correr después de agregar/editar un agente.
 */
export async function GET() {
  const resultado = verificarAntiClon();
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 409 });
}
