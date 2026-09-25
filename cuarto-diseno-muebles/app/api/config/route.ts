import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Lee config/ksmart.md tal cual está en disco — nunca hardcodea la ruta acá,
// esa vive solo en ese archivo (ver agente-ksmart-ejecutor.md).
export async function GET() {
  const configPath = path.join(process.cwd(), "config", "ksmart.md");
  if (!fs.existsSync(configPath)) {
    return NextResponse.json({ existe: false, ruta: null, confirmada: false, raw: "" });
  }
  const raw = fs.readFileSync(configPath, "utf-8");
  const rutaMatch = raw.match(/\*\*Ruta actual[^:]*:\*\*\s*`([^`]+)`/);
  const confirmada = !raw.includes("PROVISIONAL");
  return NextResponse.json({
    existe: true,
    ruta: rutaMatch ? rutaMatch[1] : null,
    confirmada,
    raw,
  });
}
