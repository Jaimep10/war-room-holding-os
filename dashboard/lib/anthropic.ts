import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function callAgent(systemPrompt: string, userMessage: string): Promise<string> {
  if (!hasApiKey()) {
    throw new Error(
      "MISSING_API_KEY: configura ANTHROPIC_API_KEY en dashboard/.env.local para activar las respuestas en vivo de los agentes."
    );
  }
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "(el agente no devolvió texto)";
}

/**
 * Intenta extraer un bloque JSON (array u objeto) de una respuesta de texto libre.
 * Prioriza un bloque ```json ... ``` explícito; si no existe, busca el primer
 * '{' o '[' y su cierre balanceado correspondiente.
 */
export function extractJson<T = any>(text: string): T | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;

  try {
    return JSON.parse(candidate.trim()) as T;
  } catch {
    // sigue abajo con extracción balanceada
  }

  const openers = ["[", "{"];
  for (const opener of openers) {
    const start = candidate.indexOf(opener);
    if (start === -1) continue;
    const closer = opener === "[" ? "]" : "}";
    let depth = 0;
    for (let i = start; i < candidate.length; i++) {
      if (candidate[i] === opener) depth++;
      else if (candidate[i] === closer) {
        depth--;
        if (depth === 0) {
          const slice = candidate.slice(start, i + 1);
          try {
            return JSON.parse(slice) as T;
          } catch {
            break;
          }
        }
      }
    }
  }
  return null;
}
