import { NextRequest, NextResponse } from "next/server";
import {
  listarInstalacionesWordpress,
  instalarWordpress,
  HostingerApiError,
  HostingerConfigError,
} from "@/lib/hostinger-client";
import { crearPaginaWordpress, bloqueEstrellasDemo, WordpressConfigError, WordpressSiteError } from "@/lib/wordpress-site-client";

/**
 * POST /api/hostinger/deploy
 *
 * Body esperado (todo dinámico -- nunca un cliente/dominio hardcodeado, REGLA MAESTRA):
 * {
 *   dominio: string,              // obligatorio
 *   username: string,             // obligatorio -- cuenta de hosting en Hostinger
 *   pageTitle: string,            // obligatorio -- título de la página a crear
 *   pageContent: string,          // obligatorio -- HTML/bloques Gutenberg del cuerpo
 *   agregarBloqueEstrellasDemo?: boolean,  // opcional -- ver lib/wordpress-site-client.ts
 *   // Solo hacen falta estos 3 si el dominio TODAVÍA no tiene WordPress instalado:
 *   adminUsuario?: string,
 *   adminPassword?: string,
 *   adminEmail?: string,
 * }
 *
 * pageTitle/pageContent son obligatorios A PROPÓSITO: este endpoint es el mecanismo genérico
 * de despliegue, no decide qué contenido lleva la página de ningún cliente en particular --
 * eso lo tiene que mandar quien lo llama (el botón de la UI, un agente, o vos a mano).
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido -- se esperaba JSON." }, { status: 400 });
  }

  const { dominio, username, pageTitle, pageContent, agregarBloqueEstrellasDemo } = body || {};

  if (!dominio || typeof dominio !== "string") {
    return NextResponse.json({ error: "Falta 'dominio'." }, { status: 400 });
  }
  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { error: "Falta 'username' (la cuenta de hosting en Hostinger dueña del dominio)." },
      { status: 400 }
    );
  }
  if (!pageTitle || !pageContent) {
    return NextResponse.json(
      {
        error:
          "Faltan 'pageTitle' y/o 'pageContent'. Este endpoint no inventa el contenido de ninguna página -- mandalos vos (ver también agregarBloqueEstrellasDemo si solo querés probar la conexión).",
      },
      { status: 400 }
    );
  }

  const pasos: Record<string, any> = {};

  // 1) Ver si el dominio ya tiene WordPress -- best effort, ver comentario en
  //    lib/hostinger-client.ts (endpoint sin confirmar del todo).
  let yaTieneWordpress = false;
  try {
    const instalaciones = await listarInstalacionesWordpress();
    yaTieneWordpress = instalaciones.some((i: any) => {
      const posiblesDominios = [i?.domain, i?.dominio, i?.site_url, i?.url].filter(Boolean);
      return posiblesDominios.some((d: string) => String(d).includes(dominio));
    });
    pasos.checkWordpress = { ok: true, yaTieneWordpress };
  } catch (err: any) {
    pasos.checkWordpress = { ok: false, error: String(err?.message || err) };
    // No cortamos acá -- seguimos e intentamos instalar; si Hostinger ya lo tiene instalado,
    // el propio paso de instalación va a devolver un error que dice eso, y lo tratamos abajo.
  }

  // 2) Instalar WordPress si hace falta.
  if (!yaTieneWordpress) {
    if (!body.adminUsuario || !body.adminPassword || !body.adminEmail) {
      return NextResponse.json(
        {
          error:
            "El dominio no aparece con WordPress instalado (o no se pudo confirmar) -- para instalarlo hacen falta 'adminUsuario', 'adminPassword' y 'adminEmail'.",
          pasos,
        },
        { status: 400 }
      );
    }
    try {
      const instalacion = await instalarWordpress({
        username,
        dominio,
        titulo: pageTitle,
        adminUsuario: body.adminUsuario,
        adminPassword: body.adminPassword,
        adminEmail: body.adminEmail,
        idioma: body.idioma,
      });
      pasos.instalarWordpress = { ok: true, instalacion };
    } catch (err: any) {
      const mensaje = String(err?.message || err);
      const pareceYaExistente = /already|existente|exists|duplicad/i.test(mensaje);
      if (pareceYaExistente) {
        pasos.instalarWordpress = { ok: true, nota: "Hostinger dice que ya existía -- seguimos.", detalle: mensaje };
      } else {
        const status = err instanceof HostingerApiError ? err.status : err instanceof HostingerConfigError ? 424 : 502;
        return NextResponse.json({ error: mensaje, pasos }, { status });
      }
    }
  } else {
    pasos.instalarWordpress = { ok: true, nota: "Ya tenía WordPress, no se reinstaló." };
  }

  // 3) Crear la página en el WordPress de destino vía su propia REST API.
  let contenidoFinal = pageContent as string;
  if (agregarBloqueEstrellasDemo) {
    contenidoFinal += "\n\n" + bloqueEstrellasDemo(5);
  }

  try {
    const pagina = await crearPaginaWordpress({
      dominio,
      titulo: pageTitle,
      contenidoHtml: contenidoFinal,
    });
    pasos.crearPagina = { ok: true, pagina };
  } catch (err: any) {
    const mensaje = String(err?.message || err);
    const status = err instanceof WordpressSiteError ? err.status : err instanceof WordpressConfigError ? 424 : 502;
    return NextResponse.json(
      {
        error: mensaje,
        nota:
          status === 424
            ? "Revisá WP_ADMIN_USER / WP_ADMIN_APP_PASSWORD en .env.local."
            : "Si el WordPress se acaba de instalar, puede que todavía no esté listo -- probá de nuevo en un par de minutos.",
        pasos,
      },
      { status }
    );
  }

  return NextResponse.json({ ok: true, pasos });
}
