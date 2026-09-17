// Fase 3 — "Manos reales" para los agentes: funciones de verdad que un agente puede invocar
// vía function-calling real de la API de Anthropic (no es texto simulando que "usa una tool").
//
// Dos herramientas, tal como se pidió:
//   - calcularFinanzas: matemática 100% real, nunca inventada.
//   - buscarMercado: HOY es un mock/placeholder (ver nota abajo) con el hook ya listo para
//     conectar un proveedor real (SerpAPI, Tavily, Bing, etc.) sin cambiar la firma.
//
// IMPORTANTE sobre buscarMercado y CLAUDE.md: el resto del sistema tiene una regla dura de
// "prohibido inventar / prohibido sin dato silencioso". Un mock que devuelve resultados falsos
// PERO con pinta de reales podría hacer que un agente los cite como si fueran un dato de mercado
// verificado — eso violaría esa regla. Por eso cada resultado del mock se marca explícitamente
// como [SIMULADO] y trae una advertencia en su propio texto: los agentes deben tratarlo como
// placeholder, nunca como fuente real, y seguir pidiendo el dato (NEEDS_CONTEXT) si lo necesitan
// de verdad. Esto no es una limitación técnica — es intencional hasta que se conecte una API real.

export interface ResultadoBusqueda {
  fuente: string;
  resumen: string;
}

/**
 * Búsqueda de mercado. SIMULADA por ahora — no hay integración con un proveedor real todavía.
 * Hook listo: para conectar SerpAPI, Tavily, Bing Search, etc., reemplaza el cuerpo de esta
 * función por un fetch real a ese proveedor y devuelve el mismo shape (fuente + resumen).
 * No cambia la firma, así que ningún llamador (tools.ts / anthropic.ts / agentes) se rompe.
 */
export async function buscarMercado(query: string): Promise<ResultadoBusqueda[]> {
  const q = (query || "").trim() || "(consulta vacía)";

  // --- Hook para integración real (deshabilitado hasta tener API key) ---
  // if (process.env.SERPAPI_KEY) {
  //   const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${process.env.SERPAPI_KEY}`);
  //   const data = await res.json();
  //   return (data.organic_results || []).slice(0, 3).map((r: any) => ({ fuente: r.link, resumen: r.snippet }));
  // }
  // if (process.env.TAVILY_API_KEY) {
  //   const res = await fetch("https://api.tavily.com/search", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query: q, max_results: 3 }),
  //   });
  //   const data = await res.json();
  //   return (data.results || []).slice(0, 3).map((r: any) => ({ fuente: r.url, resumen: r.content }));
  // }

  return [
    {
      fuente: "[SIMULADO] buscarMercado no tiene proveedor real conectado todavía",
      resumen: `Búsqueda simulada para "${q}". Esto es un placeholder de desarrollo — no es un dato de mercado real ni verificado. No lo cites como fuente. Conecta SERPAPI_KEY o TAVILY_API_KEY (ver hook comentado en lib/tools.ts) para resultados reales.`,
    },
    {
      fuente: "[SIMULADO] resultado genérico 2",
      resumen: `Sin este proveedor conectado, no hay forma honesta de saber nada real sobre "${q}". Si el usuario necesita ese dato para su análisis, pídeselo directamente (Motor de Contexto / NEEDS_CONTEXT) en vez de asumir este mock.`,
    },
    {
      fuente: "[SIMULADO] resultado genérico 3",
      resumen: `Placeholder de buscarMercado("${q}"). El hook para producción ya está escrito y comentado en dashboard/lib/tools.ts — solo falta la API key real.`,
    },
  ];
}

export interface CalcularFinanzasInput {
  precio: number;
  costoVariable: number;
  gastosFijos: number;
  unidadesMes: number;
}

export interface CalcularFinanzasResult {
  ok: boolean;
  error?: string;
  margenPorc?: number; // (precio - costoVariable) / precio * 100
  margenUsd?: number; // precio - costoVariable
  puntoEquilibrioUnidades?: number; // gastosFijos / (precio - costoVariable)
  utilidadMensual?: number; // margenUsd * unidadesMes - gastosFijos
  precioSugerido30?: number; // precio necesario para un margen del 30% sobre este costo
  detalle?: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Cálculo financiero 100% real (matemática pura, nada inventado). Úsalo siempre que tengas
 * los 4 números — nunca lo calcules "a ojo" en el texto de la respuesta.
 *
 * Fórmulas:
 *   margenPorc               = (precio - costoVariable) / precio * 100
 *   margenUsd                = precio - costoVariable
 *   puntoEquilibrioUnidades  = gastosFijos / (precio - costoVariable)
 *   utilidadMensual          = margenUsd * unidadesMes - gastosFijos
 *   precioSugerido30         = costoVariable / (1 - 0.30)   (precio que daría 30% de margen)
 */
export function calcularFinanzas(input: CalcularFinanzasInput): CalcularFinanzasResult {
  const precio = Number(input?.precio);
  const costoVariable = Number(input?.costoVariable);
  const gastosFijos = Number(input?.gastosFijos);
  const unidadesMes = Number(input?.unidadesMes);

  if (![precio, costoVariable, gastosFijos, unidadesMes].every(Number.isFinite)) {
    return {
      ok: false,
      error: "Faltan o son inválidos precio, costoVariable, gastosFijos o unidadesMes — los 4 deben ser números.",
    };
  }
  if (precio <= 0 || costoVariable < 0 || gastosFijos < 0 || unidadesMes < 0) {
    return {
      ok: false,
      error: "precio, costoVariable, gastosFijos y unidadesMes deben ser >= 0 (precio > 0).",
    };
  }
  if (precio <= costoVariable) {
    return {
      ok: false,
      error: "El precio debe ser mayor al costo variable — si no, no hay margen positivo que calcular.",
    };
  }

  const margenUsd = precio - costoVariable;
  const margenPorc = (margenUsd / precio) * 100;
  const puntoEquilibrioUnidades = gastosFijos / margenUsd;
  const utilidadMensual = margenUsd * unidadesMes - gastosFijos;
  const precioSugerido30 = costoVariable / (1 - 0.3);

  return {
    ok: true,
    margenUsd: round2(margenUsd),
    margenPorc: round2(margenPorc),
    puntoEquilibrioUnidades: round2(puntoEquilibrioUnidades),
    utilidadMensual: round2(utilidadMensual),
    precioSugerido30: round2(precioSugerido30),
    detalle:
      `margenUsd = ${precio} - ${costoVariable} = ${round2(margenUsd)}. ` +
      `margenPorc = (${round2(margenUsd)} / ${precio}) * 100 = ${round2(margenPorc)}%. ` +
      `puntoEquilibrioUnidades = ${gastosFijos} / ${round2(margenUsd)} = ${round2(puntoEquilibrioUnidades)} uds/mes. ` +
      `utilidadMensual = ${round2(margenUsd)} * ${unidadesMes} - ${gastosFijos} = ${round2(utilidadMensual)}. ` +
      `precioSugerido30 (precio para 30% de margen sobre este costo) = ${costoVariable} / (1 - 0.30) = ${round2(precioSugerido30)}.`,
  };
}

// ---------- Definiciones de function-calling para la API de Anthropic ----------

export const AGENT_TOOLS = [
  {
    name: "calcularFinanzas",
    description:
      "Calcula margen %, margen en USD, punto de equilibrio en unidades, utilidad mensual y precio sugerido para 30% de margen, a partir de precio, costo variable, gastos fijos y unidades vendidas al mes. Cálculo real con matemática, nunca lo inventes ni lo hagas a mano en el texto — si tienes estos 4 números, USA esta herramienta.",
    input_schema: {
      type: "object",
      properties: {
        precio: { type: "number", description: "Precio de venta por unidad." },
        costoVariable: { type: "number", description: "Costo variable por unidad." },
        gastosFijos: { type: "number", description: "Gastos fijos mensuales totales." },
        unidadesMes: { type: "number", description: "Unidades vendidas (o esperadas) por mes." },
      },
      required: ["precio", "costoVariable", "gastosFijos", "unidadesMes"],
    },
  },
  {
    name: "buscarMercado",
    description:
      "Busca información de mercado/competencia sobre un término. AVISO: hoy devuelve resultados SIMULADOS (no hay proveedor de búsqueda real conectado todavía) — nunca presentes su resultado como un dato de mercado verificado; si el usuario necesita el dato real, pídeselo (Motor de Contexto / NEEDS_CONTEXT) en vez de usar el mock como si fuera verdad.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda (ej: nombre del competidor + país, o el dato exacto que falta).",
        },
      },
      required: ["query"],
    },
  },
] as const;

export interface EjecucionTool {
  name: string;
  input: any;
  result: any;
}

export async function executeTool(name: string, input: any): Promise<any> {
  switch (name) {
    case "calcularFinanzas":
      return calcularFinanzas(input as CalcularFinanzasInput);
    case "buscarMercado":
      return await buscarMercado(input?.query);
    default:
      return { ok: false, error: `Herramienta desconocida: ${name}` };
  }
}
