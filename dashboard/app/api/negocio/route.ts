import { NextRequest, NextResponse } from "next/server";
import { appendResultSection, buildCombinedSystemPrompt, createNegocioExistente } from "@/lib/memoria";
import { callAgent, extractJson } from "@/lib/anthropic";

const AGENTES_MODO3 = [
  "agente-operaciones",
  "agente-compras-procurement",
  "agente-finanzas",
  "agente-talento",
  "agente-cliente",
  "agente-producto",
  "agente-legal",
];

export interface NegocioDiagnostico {
  fugas: { area: string; detalle: string; impacto_mensual_estimado: string }[];
  palancas: { accion: string; detalle: string; impacto_estimado: string }[];
  plan_90_dias: { fase: string; tareas: string[] }[];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const nombre = (body?.nombre || "").toString();
  const giro = (body?.giro || "").toString();
  const facturacion = Number(body?.facturacion);
  const margen = Number(body?.margen);
  const empleados = Number(body?.empleados);
  const dolor = (body?.dolor || "").toString();

  if (!nombre || !giro) {
    return NextResponse.json({ error: "Faltan datos (nombre, giro)." }, { status: 400 });
  }

  const { file } = createNegocioExistente({ nombre, giro, facturacion, margen, empleados, dolor });

  try {
    const systemPrompt = buildCombinedSystemPrompt(AGENTES_MODO3);
    const userMessage = `## CONTEXTO DEL NEGOCIO (memoria/ideas/${file})

- Nombre: ${nombre}
- Giro: ${giro}
- Facturación mensual actual: $${facturacion}
- Margen actual: ${margen}%
- Empleados: ${empleados}
- Principal dolor declarado: ${dolor}

---

## Instrucción del usuario

Como reunión de Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal, diagnostiquen este negocio EXISTENTE (no una idea nueva). Recuerden la Ley Suprema: si el giro es Restaurante, ningún agente menciona pisos ni ningún otro rubro ajeno — razonen 100% en términos de "${giro}".

Responde ÚNICAMENTE con un bloque \`\`\`json con esta forma exacta:

{
  "fugas": [ { "area": string, "detalle": string, "impacto_mensual_estimado": string } ],
  "palancas": [ { "accion": string, "detalle": string, "impacto_estimado": string } ],
  "plan_90_dias": [ { "fase": "Días 1-30" | "Días 31-60" | "Días 61-90", "tareas": [string, ...] } ]
}

Incluye entre 3 y 6 fugas, exactamente 3 palancas (las 3 acciones más importantes para duplicar utilidad sin vender más), y las 3 fases del plan de 90 días. No incluyas texto fuera del bloque \`\`\`json.`;

    const text = await callAgent(systemPrompt, userMessage);
    const diagnostico = extractJson<NegocioDiagnostico>(text);

    appendResultSection(
      file,
      "Resultado de la Reunión (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal)",
      diagnostico ? "```json\n" + JSON.stringify(diagnostico, null, 2) + "\n```" : text
    );

    if (!diagnostico) {
      return NextResponse.json({ file, raw: text, diagnostico: null, warning: "No se pudo parsear JSON estructurado; se devuelve el texto crudo." });
    }

    return NextResponse.json({ file, diagnostico });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err), file }, { status: 502 });
  }
}
