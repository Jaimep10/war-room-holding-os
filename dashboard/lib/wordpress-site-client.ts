/**
 * Cliente REST API del WORDPRESS DE DESTINO (no de Hostinger -- son dos APIs distintas).
 * WordPress expone su propia REST API pública y estable en /wp-json/wp/v2/* desde el core,
 * documentada en https://developer.wordpress.org/rest-api/reference/pages/ -- esta parte no
 * depende de Hostinger y no tiene la incertidumbre que sí tiene lib/hostinger-client.ts.
 *
 * Autenticación: la REST API de WordPress NO acepta la contraseña normal de wp-admin por
 * Basic Auth -- desde WP 5.6 hace falta un "Application Password" generado en wp-admin >
 * Usuarios > Tu perfil > Application Passwords (WP_ADMIN_USER / WP_ADMIN_APP_PASSWORD en
 * .env.local). Si el sitio se acaba de instalar vía Hostinger, ese Application Password hay
 * que crearlo a mano una vez entrando al wp-admin del sitio -- no hay forma de generarlo por
 * API sin haber iniciado sesión primero, así que no se puede saltar ese paso manual.
 */
import "./load-env";

export class WordpressConfigError extends Error {}
export class WordpressSiteError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`WordPress (REST API del sitio) devolvió ${status}: ${body}`);
    this.status = status;
    this.body = body;
  }
}

function authHeader(): string {
  const user = process.env.WP_ADMIN_USER;
  const appPassword = process.env.WP_ADMIN_APP_PASSWORD;
  if (!user || !appPassword) {
    throw new WordpressConfigError(
      "Faltan WP_ADMIN_USER / WP_ADMIN_APP_PASSWORD en dashboard/.env.local -- son un Application Password generado en wp-admin del sitio de destino, no tu password normal. Mirá dashboard/.env.local.example."
    );
  }
  return "Basic " + Buffer.from(`${user}:${appPassword}`).toString("base64");
}

export interface CrearPaginaParams {
  dominio: string; // ej. "midominio.com" -- nunca hardcodeado, viene del request
  titulo: string; // obligatorio: el título de la página, lo define quien llama al endpoint
  contenidoHtml: string; // obligatorio: HTML/bloques Gutenberg, lo define quien llama al endpoint
  estado?: "publish" | "draft";
}

export async function crearPaginaWordpress(params: CrearPaginaParams) {
  const url = `https://${params.dominio}/wp-json/wp/v2/pages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: params.titulo,
      content: params.contenidoHtml,
      status: params.estado || "publish",
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new WordpressSiteError(res.status, text);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Bloque Gutenberg de EJEMPLO/genérico -- 5 estrellas decorativas vía core/html.
 *
 * ATENCIÓN: esto es un placeholder genérico, NO "el sistema de estrellitas" real de ningún
 * cliente. No sé (y no debo inventar) si lo que se pidió es esto mismo, un widget de reviews
 * de verdad, un sistema de puntos/recompensas para chicos de una guardería, u otra cosa --
 * eso hay que preguntarlo (ver NEEDS_CONTEXT en la respuesta al usuario). Se deja acá solo
 * como mecanismo reusable ya armado, para no tener que escribir el HTML de cero una vez que
 * se confirme qué es lo que realmente hay que mostrar.
 */
export function bloqueEstrellasDemo(cantidad: number = 5): string {
  const estrella = (llena: boolean) =>
    `<svg width="28" height="28" viewBox="0 0 24 24" fill="${llena ? "#f5b301" : "none"}" stroke="#f5b301" stroke-width="1.5" style="display:inline-block;margin:0 2px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`;
  const estrellas = Array.from({ length: 5 }, (_, i) => estrella(i < cantidad)).join("");
  return `<!-- wp:html -->\n<div class="war-room-estrellitas-demo" style="text-align:center;padding:12px 0;">${estrellas}</div>\n<!-- /wp:html -->`;
}
