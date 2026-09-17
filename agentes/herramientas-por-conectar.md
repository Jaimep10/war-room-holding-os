---
tipo: Roadmap de integraciones pendientes
fecha: 2026-09-11
---

# Herramientas por conectar — Redes y SEO

> Se verificó en esta sesión (ListConnectors + SearchMcpRegistry) si existe ya alguna conexión a
> Facebook Graph API o Instagram Graph API disponible para este equipo. **No existe ninguna.** No hay
> ningún conector de Meta (Facebook/Instagram) instalado ni disponible en el registro de conectores de
> Claude bajo ese nombre. Tampoco existe un conector llamado literalmente "Google Search Console".

## Lo que falta conectar

- **Meta Graph API** — para publicar posts/reels directo en la página de Facebook y la cuenta de
  Instagram profesional (requiere una App de Meta for Developers + token de acceso de página/negocio).
- **Instagram Basic Display** (o su sucesor, Instagram Graph API para cuentas profesionales) — para
  leer/publicar contenido de Instagram vinculado a la página de Facebook.
- **Google Search Console** — para medir de verdad el SEO (posiciones, clics, impresiones) de la web
  de GECKO, en vez de solo redactar contenido a ciegas sin saber si rankea.

## Lo que SÍ existe en el registro de conectores (no instalado, pero disponible si se quiere conectar)

Ninguno es Meta/Facebook/Instagram directo, pero para el lado de SEO sí hay opciones reales ya
catalogadas que se podrían instalar desde claude.ai si se decide usarlas más adelante:

- **Ahrefs** — SEO y analítica de búsqueda con IA.
- **Semrush** — SEO, investigación de palabras clave, análisis de competencia, tráfico y backlinks.
- **OpenRush** — SEO y análisis de competencia con datos de búsqueda en vivo (rank tracking, auditoría
  de sitio).
- **Helena (Enrich Labs)** — asistente de marketing todo-en-uno (paid ads, SEO, email, social,
  analytics) — un solo tool `send_turn`, function genérica, habría que probar qué tan bien cubre esto.
- **Abency** — gestión de marcas de agencia, incluye `canva_export_design` y herramientas de ads —
  más cercano a lo que ya se usa con Canva, vale la pena mirarlo si se pautan varios clientes a la vez.

Ninguno de estos está conectado hoy — esto es solo el mapa de qué existe, no una conexión activa.

## Por qué esto importa (ligado a la auditoría de agencia)

Este archivo confirma en la práctica el hallazgo #1 de `memoria/auditoria-agencia-completa.md`: el
equipo puede crear contenido (Canva, copy, artículos) pero no tiene forma de publicarlo ni medirlo
directamente en redes o buscadores todavía. Sin Meta Graph API, todo kit de redes que se genere queda
en archivos listos para publicar manualmente — no se publica solo.
