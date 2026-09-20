import { tavily } from "@tavily/core";

/**
 * Cliente de Tavily perezoso: si falta la key, NO explota al importar el módulo
 * (como pasaba antes con `tavily({ apiKey: process.env.TAVILY_API_KEY! })` a nivel
 * de módulo) — devuelve null y el llamador decide el mensaje de error.
 */
function getTavilyClient() {
  if (!process.env.TAVILY_API_KEY) return null;
  return tavily({ apiKey: process.env.TAVILY_API_KEY });
}

/**
 * hostinger_api — usa HOSTINGER_API_TOKEN (nunca hardcodeado).
 * Base URL y endpoints tomados de https://docs.hostinger.com/api-reference (API de Hostinger,
 * checkeado sep-2026). Hostinger puede cambiar campos del body con el tiempo — si algo devuelve
 * 400/422, revisa el body real contra https://developers.hostinger.com/openapi/openapi.json
 * antes de asumir que el código está mal.
 */
const HOSTINGER_BASE_URL = "https://developers.hostinger.com";

function hostingerHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export const AGENT_TOOLS = [
  {
    name: "calcularFinanzas",
    description: "Calcula margen, precio por m2, ROI",
    input_schema: {
      type: "object",
      properties: {
        m2: { type: "number" },
        costoMaterial: { type: "number" },
        costoInstalacion: { type: "number" },
        margenDeseado: { type: "number" },
      },
      required: ["m2", "costoMaterial"],
    },
  },
  {
    name: "buscarMercado",
    description: "Busca precios reales y competencia en Ecuador (requiere TAVILY_API_KEY en .env.local)",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        pais: { type: "string", default: "Ecuador" },
      },
      required: ["query"],
    },
  },
  {
    name: "generarOrganigrama",
    description: "Genera organigrama visual",
    input_schema: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["equipo", "holding", "proceso"] },
        miembros: { type: "array", items: { type: "string" } },
      },
      required: ["tipo"],
    },
  },
  {
    name: "hostinger_api",
    description:
      "Gestiona el hosting de Hostinger del cliente activo (requiere HOSTINGER_API_TOKEN en .env.local): listar los sitios de la cuenta o crear una instalación de WordPress nueva.",
    input_schema: {
      type: "object",
      properties: {
        accion: { type: "string", enum: ["listar_sitios", "crear_wordpress"] },
        username: {
          type: "string",
          description: "Username de la cuenta de hosting en Hostinger (requerido para crear_wordpress)",
        },
        dominio: {
          type: "string",
          description: "Dominio donde se instalará WordPress (requerido para crear_wordpress)",
        },
        titulo: { type: "string", description: "Título del sitio WordPress" },
        adminUsuario: { type: "string", description: "Usuario admin de WordPress a crear" },
        adminPassword: { type: "string", description: "Password admin de WordPress a crear" },
        adminEmail: { type: "string", description: "Email admin de WordPress a crear" },
        idioma: { type: "string", default: "es" },
      },
      required: ["accion"],
    },
  },
];

export async function ejecutarHerramienta(name: string, args: any) {
  if (name === "buscarMercado") {
    const tvly = getTavilyClient();
    if (!tvly) {
      return {
        error: true,
        mensaje: "Falta TAVILY_API_KEY en .env.local - agregala con echo 'TAVILY_API_KEY=...' >> .env.local",
      };
    }
    // La firma real de @tavily/core (v0.7.x instalada) es search(query: string, options?) con
    // opciones en camelCase — no search({query, max_results, ...}) como un solo objeto snake_case.
    const res = await tvly.search(`${args.query} ${args.pais || "Ecuador"}`, {
      maxResults: 5,
      searchDepth: "advanced",
      includeAnswer: true,
    });
    return { verificado: true, fuente: res.results.map((r: any) => r.url), datos: res.answer, resultados: res.results };
  }

  if (name === "calcularFinanzas") {
    const totalCosto = args.costoMaterial + (args.costoInstalacion || 0);
    const precioVenta = totalCosto * (1 + (args.margenDeseado || 0.4));
    return { totalCosto, precioVenta, margen: args.margenDeseado || 0.4, verificado: true };
  }

  if (name === "generarOrganigrama") {
    return { trigger: "GENERAR_IMAGEN_ORGANIGRAMA", tipo: args.tipo, miembros: args.miembros };
  }

  if (name === "hostinger_api") {
    const token = process.env.HOSTINGER_API_TOKEN;
    if (!token) {
      return {
        error: true,
        mensaje: "Falta HOSTINGER_API_TOKEN en .env.local - agregala con echo 'HOSTINGER_API_TOKEN=...' >> .env.local",
      };
    }

    if (args.accion === "listar_sitios") {
      const res = await fetch(`${HOSTINGER_BASE_URL}/api/hosting/v1/websites`, {
        headers: hostingerHeaders(token),
      });
      if (!res.ok) {
        return { error: true, mensaje: `Hostinger API devolvió ${res.status}: ${await res.text()}` };
      }
      const data = await res.json();
      return { verificado: true, sitios: data };
    }

    if (args.accion === "crear_wordpress") {
      if (!args.username || !args.dominio) {
        return { error: true, mensaje: "Faltan 'username' (cuenta de hosting) y/o 'dominio' para crear el WordPress." };
      }
      const res = await fetch(`${HOSTINGER_BASE_URL}/api/hosting/v1/accounts/${args.username}/wordpress/installations`, {
        method: "POST",
        headers: hostingerHeaders(token),
        body: JSON.stringify({
          domain: args.dominio,
          title: args.titulo || args.dominio,
          admin_user: args.adminUsuario,
          admin_password: args.adminPassword,
          admin_email: args.adminEmail,
          language: args.idioma || "es",
        }),
      });
      if (!res.ok) {
        return { error: true, mensaje: `Hostinger API devolvió ${res.status}: ${await res.text()}` };
      }
      const data = await res.json();
      return { verificado: true, instalacion: data };
    }

    return { error: true, mensaje: `accion '${args.accion}' no reconocida para hostinger_api. Usa 'listar_sitios' o 'crear_wordpress'.` };
  }
}
