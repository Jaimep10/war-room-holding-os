import { NextResponse } from "next/server";
import { validarToken, listarWebsites, listarVirtualMachines } from "@/lib/hostinger-client";

/**
 * Endpoint liviano para el botón "Conectar a Hostinger" del dashboard: prueba el token de
 * .env.local y devuelve los dominios/VPS de la cuenta. No recibe nada del cliente -- todo sale
 * de HOSTINGER_API_TOKEN en el servidor, el token nunca viaja al navegador.
 */
export async function GET() {
  const validacion = await validarToken();
  if (!validacion.valido) {
    return NextResponse.json({ valido: false, error: validacion.error }, { status: 424 });
  }

  const websites = await listarWebsites().catch((err: any) => {
    return { __error: String(err?.message || err) };
  });

  // La API de VPS no está 100% confirmada (ver comentario en lib/hostinger-client.ts) -- si
  // falla, no tumbamos todo el status, devolvemos el error de esa parte nada más.
  let virtualMachines: any[] = [];
  let vpsError: string | undefined;
  try {
    virtualMachines = await listarVirtualMachines();
  } catch (err: any) {
    vpsError = String(err?.message || err);
  }

  return NextResponse.json({
    valido: true,
    websites: Array.isArray(websites) ? websites : [],
    websitesError: Array.isArray(websites) ? undefined : (websites as any).__error,
    virtualMachines,
    vpsError,
  });
}
