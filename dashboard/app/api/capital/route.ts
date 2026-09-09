import { NextRequest, NextResponse } from "next/server";
import { appendResultSection, buildCombinedSystemPrompt, createCapitalIdea } from "@/lib/memoria";
import { callAgent, extractJson } from "@/lib/anthropic";

const AGENTES_MODO2 = ["agente-analista", "agente-finanzas", "agente-compras-procurement", "agente-pesimista"];

export interface CapitalCard {
  nombre: string;
  score_pesimista: number;
  riesgo: string;
  inversion: { producto: number; flete: number; ads: number; buffer: number; total: number };
  margen_pct: number;
  validacion_7_dias: string;
  por_que_elegida: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const capital = Number(body?.capital);
  const ciudad = (body?.ciudad || "").toString();
  const horasSemana = Number(body?.horasSemana);
  const habilidades = (body?.habilidades || "").toString();
  const retorno = (body?.retorno || "").toString();

  if (!capital || !ciudad) {
    return NextResponse.json({ error: "Faltan datos (capital, ciudad)." }, { status: 400 });
  }

  const { file } = createCapitalIdea({ capital, ciudad, horasSemana, habilidades, retorno });

  try {
    const systemPrompt = buildCombinedSystemPrompt(AGENTES_MODO2);
    const userMessage = `## CONTEXTO DEL USUARIO (memoria/ideas/${file})

- Capital disponible: $${capital}
- Ciudad: ${ciudad}
- Horas por semana disponibles: ${horasSemana}
- Habilidades / activos: ${habilidades}
- Retorno deseado: ${retorno}

---

## Instrucción del usuario

Como reunión de Analista + Finanzas + Compras + Pesimista, propongan EXACTAMENTE 10 ideas de negocio comparables, realistas para este capital, ciudad y horas disponibles. Para cada una, usa Kraljic (compras), Taleb (punto único de fallo) y TCO (costo total de propiedad, no solo precio de compra) en tu razonamiento.

Responde ÚNICAMENTE con un bloque \`\`\`json que contenga un array de 10 objetos, cada uno con esta forma exacta:

{
  "nombre": string,
  "score_pesimista": number (0-10),
  "riesgo": "Bajo" | "Medio" | "Alto",
  "inversion": { "producto": number, "flete": number, "ads": number, "buffer": number, "total": number },
  "margen_pct": number,
  "validacion_7_dias": string (qué haría el usuario en 7 días por menos de $100 para validar, antes de invertir todo el capital),
  "por_que_elegida": string (razón del equipo, mencionando explícitamente el framework usado: Kraljic, Taleb o TCO)
}

No incluyas texto fuera del bloque \`\`\`json.`;

    const text = await callAgent(systemPrompt, userMessage);
    const cards = extractJson<CapitalCard[]>(text);

    appendResultSection(
      file,
      "Resultado de la Reunión (Analista + Finanzas + Compras + Pesimista)",
      cards ? "```json\n" + JSON.stringify(cards, null, 2) + "\n```" : text
    );

    if (!cards) {
      return NextResponse.json({ file, raw: text, cards: null, warning: "No se pudo parsear JSON estructurado; se devuelve el texto crudo." });
    }

    return NextResponse.json({ file, cards });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err), file }, { status: 502 });
  }
}
