/**
 * Cliente de la API de Hostinger (https://developers.hostinger.com) para el dashboard.
 *
 * OJO -- transparencia sobre lo que está confirmado y lo que no (Motor de Contexto: nunca
 * fingir que algo está verificado cuando no lo está):
 *
 * Estos 3 endpoints están CONFIRMADOS -- coinciden tanto con la documentación pública
 * (docs.hostinger.com/api-reference, revisada sep-2026) como con el código YA EXISTENTE en
 * `lib/tools.ts` (la tool `hostinger_api` que ya usan los agentes desde antes), que los viene
 * usando en producción:
 *   - GET  /api/hosting/v1/websites
 *   - POST /api/hosting/v1/accounts/{username}/wordpress/installations
 *
 * Estos otros los saqué de la documentación pero NO pude confirmarlos contra una cuenta real
 * (esta sesión no tiene un HOSTINGER_API_TOKEN real para probar, y el fetch automático a la
 * spec completa (openapi.json) devolvió resultados inconsistentes entre sí -- así que están
 * marcados como "sin confirmar" en su comentario. Si tiran 404/422, lo primero es revisar el
 * path real contra https://developers.hostinger.com/openapi/openapi.json con tu token:
 *   - GET  /api/vps/v1/virtual-machines
 *   - GET  /api/hosting/v1/wordpress/installations
 *   - POST /api/hosting/v1/accounts/{username}/wordpress/installations/detect
 *   - GET  /api/hosting/v1/accounts/{username}/wordpress/{software}/jwt-token
 *
 * Nunca hardcodees acá un dominio, username o cliente específico -- todo entra como parámetro
 * (REGLA MAESTRA -- agencia abierta).
 */

// Next.js ya carga .env.local solo en rutas de servidor -- este import es una capa extra
// defensiva (por si este módulo se llama alguna vez desde un script suelto fuera del runtime
// de Next, ej. una migración con `tsx lib/hostinger-client.ts`), tal como se pidió.
import "./load-env";

const HOSTINGER_BASE_URL = "https://developers.hostinger.com";

export class HostingerConfigError extends Error {}
export class HostingerApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Hostinger API devolvió ${status}: ${body}`);
    this.status = status;
    this.body = body;
  }
}

function getToken(): string {
  const token = process.env.HOSTINGER_API_TOKEN;
  if (!token) {
    throw new HostingerConfigError(
      "Falta HOSTINGER_API_TOKEN. Agregalo a dashboard/.env.local (mirá dashboard/.env.local.example) -- nunca se lo pases a Claude por el chat."
    );
  }
  return token;
}

async function hostingerFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${HOSTINGER_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new HostingerApiError(res.status, await res.text().catch(() => ""));
  }
  // 202 (procesamiento async) puede no traer body JSON.
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/** Tipos laxos a propósito: la forma exacta de la respuesta no está 100% confirmada (ver comentario arriba). */
export interface HostingerWebsite {
  [key: string]: any;
}
export interface HostingerVirtualMachine {
  [key: string]: any;
}

/**
 * Valida el token pegándole al endpoint más liviano y ya confirmado (listar sitios).
 * No hay un endpoint dedicado de "whoami" documentado -- esta es la forma real de probar
 * que el token funciona sin asumir nada que no esté verificado.
 */
export async function validarToken(): Promise<{ valido: boolean; error?: string }> {
  try {
    await hostingerFetch("/api/hosting/v1/websites");
    return { valido: true };
  } catch (err: any) {
    if (err instanceof HostingerConfigError) return { valido: false, error: err.message };
    if (err instanceof HostingerApiError) {
      if (err.status === 401 || err.status === 403) {
        return { valido: false, error: "Token inválido o sin permisos (401/403). Revisá HOSTINGER_API_TOKEN en .env.local." };
      }
      return { valido: false, error: err.message };
    }
    return { valido: false, error: String(err?.message || err) };
  }
}

export async function listarWebsites(): Promise<HostingerWebsite[]> {
  const data = await hostingerFetch<any>("/api/hosting/v1/websites");
  // La API puede paginar (ej. { data: [...] }) o devolver el array directo -- soportamos ambas
  // formas sin asumir cuál es, ya que no pude confirmar la forma exacta (ver comentario arriba).
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
}

/** Sin confirmar contra una cuenta real -- ver comentario arriba del archivo. */
export async function listarVirtualMachines(): Promise<HostingerVirtualMachine[]> {
  const data = await hostingerFetch<any>("/api/vps/v1/virtual-machines");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
}

/** Sin confirmar contra una cuenta real -- ver comentario arriba del archivo. */
export async function listarInstalacionesWordpress(): Promise<any[]> {
  const data = await hostingerFetch<any>("/api/hosting/v1/wordpress/installations");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
}

export interface InstalarWordpressParams {
  username: string; // cuenta de hosting en Hostinger (obligatorio, nunca hardcodeado)
  dominio: string;
  titulo?: string;
  adminUsuario: string;
  adminPassword: string;
  adminEmail: string;
  idioma?: string;
}

/** Confirmado (coincide con lib/tools.ts, ya en uso). */
export async function instalarWordpress(params: InstalarWordpressParams) {
  return hostingerFetch<any>(`/api/hosting/v1/accounts/${params.username}/wordpress/installations`, {
    method: "POST",
    body: JSON.stringify({
      domain: params.dominio,
      title: params.titulo || params.dominio,
      admin_user: params.adminUsuario,
      admin_password: params.adminPassword,
      admin_email: params.adminEmail,
      language: params.idioma || "es",
    }),
  });
}

/**
 * JWT para autenticarse directo contra ESE WordPress (no contra la API de Hostinger) --
 * según la documentación, sirve para pegarle a la instalación "incluyendo su endpoint MCP".
 * Sin confirmar el shape exacto de la respuesta -- probalo con un token real antes de confiar
 * en esto para producción; mientras tanto, el deploy endpoint usa como alternativa un usuario +
 * application password de WordPress (WP_ADMIN_USER / WP_ADMIN_APP_PASSWORD en .env.local).
 */
export async function obtenerJwtWordpress(username: string, software: string) {
  return hostingerFetch<any>(`/api/hosting/v1/accounts/${username}/wordpress/${software}/jwt-token`);
}
