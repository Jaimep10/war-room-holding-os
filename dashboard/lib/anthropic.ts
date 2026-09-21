import Anthropic from "@anthropic-ai/sdk";
import { AGENT_TOOLS, ejecutarHerramienta } from "./tools";

/** V2 (Tavily): tools.ts ya no exporta este tipo, se define aquí para no romper el resto del código. */
export interface EjecucionTool {
  name: string;
  input: any;
  result: any;
}

let client: Anthropic | null = null;

/**
 * Lee ANTHROPIC_API_KEY de .env.local y la limpia: quita saltos de línea (\r, \n)
 * y espacios al principio/final. Un copy/paste al .env.local a veces deja un
 * salto de línea o espacio colgando (ej. `echo "ANTHROPIC_API_KEY=..." >> .env.local`
 * mal cerrado, o un editor que agrega \r) y eso rompe el header Authorization real
 * contra la API de Anthropic con un error que parece "key inválida" sin serlo.
 */
function getAnthropicApiKey(): string | undefined {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw) return undefined;
  const limpia = raw.replace(/[\r\n]/g, "").trim();
  return limpia || undefined;
}

export function hasApiKey(): boolean {
  return Boolean(getAnthropicApiKey());
}

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getAnthropicApiKey() });
  }
  return client;
}

export interface CallAgentOptions {
  /** Da acceso real a calcularFinanzas/buscarMercado vía function-calling. Default: true. */
  useTools?: boolean;
  /** Máximo de idas y vueltas de herramientas antes de forzar una respuesta de texto. */
  maxToolRounds?: number;
}

export interface CallAgentResult {
  text: string;
  /** Qué herramientas usó de verdad el agente en esta llamada (para mostrar transparencia en el dashboard). */
  toolCalls: EjecucionTool[];
}

/**
 * Fase 3 — tool-calling real: si el modelo pide usar calcularFinanzas o buscarMercado,
 * de verdad las ejecutamos (no es texto simulado) y le devolvemos el resultado real para
 * que termine su respuesta con ese dato, en vez de inventarlo.
 */
export async function callAgentWithTools(
  systemPrompt: string,
  userMessage: string,
  options: CallAgentOptions = {}
): Promise<CallAgentResult> {
  if (!hasApiKey()) {
    throw new Error(
      "MISSING_API_KEY: configura ANTHROPIC_API_KEY en dashboard/.env.local para activar las respuestas en vivo de los agentes."
    );
  }
  const { useTools = true, maxToolRounds = 4 } = options;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
  const anthropic = getClient();

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];
  const toolCalls: EjecucionTool[] = [];

  for (let round = 0; round <= maxToolRounds; round++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1500,
      system: systemPrompt,
      messages,
      ...(useTools ? { tools: AGENT_TOOLS as unknown as Anthropic.Tool[] } : {}),
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    if (response.stop_reason !== "tool_use" || toolUseBlocks.length === 0 || round === maxToolRounds) {
      const textBlock = response.content.find((b) => b.type === "text");
      return {
        text: textBlock && textBlock.type === "text" ? textBlock.text : "(el agente no devolvió texto)",
        toolCalls,
      };
    }

    // El modelo pidió usar una o más herramientas reales — las ejecutamos de verdad y le
    // devolvemos el resultado real para que las use en su respuesta final (nunca lo inventa).
    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = await ejecutarHerramienta(block.name, block.input);
      toolCalls.push({ name: block.name, input: block.input, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { text: "(el agente no devolvió texto tras agotar las rondas de herramientas)", toolCalls };
}

/** Wrapper simple para quien solo necesite el texto (sin exponer las herramientas usadas). */
export async function callAgent(
  systemPrompt: string,
  userMessage: string,
  options: CallAgentOptions = {}
): Promise<string> {
  const result = await callAgentWithTools(systemPrompt, userMessage, options);
  return result.text;
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
