---
cliente: GECKO - Acabados Hospitalarios
tipo: Definición del flujo "Activa cliente GECKO en redes"
---

# Flujo: "Activa cliente GECKO en redes"

Esta carpeta existe porque Jaime pidió un flujo repetible: decir **"Activa cliente GECKO en redes"** y
que el equipo genere, sin más preguntas, el kit completo. Esta corrida (11-sept-2026) es la primera
ejecución real del flujo — sirve como plantilla para las siguientes veces que se dispare.

## Qué se genera cada vez que se activa este flujo

| Entregable | Archivo | Agente/marco que lo produce |
|---|---|---|
| Bio SEO (Instagram + Facebook) | `bio-seo.md` | `marketing-seo-content` (Topic Clusters, Jobs to Be Done) |
| Kit de 9 posts orgánicos | `kit-9-posts.md` | `marketing-social-organic` (Contagious/STEPPS, Berger) |
| 3 artículos de blog (uno por área: quirófano, Rayos X, UCI) | `articulo-1-quirofanos.md`, `articulo-2-rayos-x.md`, `articulo-3-uci.md` | `marketing-seo-content` (Topic Clusters) + datos verificados en `../detalle-tecnico-legal.md` |

## Regla no negociable del flujo

Ningún contenido generado por este flujo puede citar una cifra de norma (ohmiaje, EN1081) sin
verificarla antes contra `clientes/gecko-acabados-hospitalarios/detalle-tecnico-legal.md`. Si ese
archivo cambia (por ejemplo, si Legal actualiza la verificación con una fuente nueva), este kit debe
regenerarse — no se asume que el contenido viejo sigue siendo correcto.

## Lo que este flujo NO hace (todavía)

- **No publica nada directo en Facebook/Instagram.** Genera los archivos; publicarlos es manual hasta
  que exista una conexión a Meta Graph API (ver `agentes/herramientas-por-conectar.md`).
- **No genera las imágenes/artes de los 9 posts automáticamente.** El kit da copy + dirección visual;
  producir los artes reales en Canva es un paso aparte (mismo flujo ya usado en las campañas de Ads).
- **No mide resultados.** Sin Meta Graph API ni Google Search Console conectados, no hay forma de saber
  qué post o artículo funcionó mejor — eso también está listado como pendiente.

## Cómo se regenera

La próxima vez que se diga "Activa cliente GECKO en redes", el Director debe: releer
`../brand.md`, `../producto.md` y `../detalle-tecnico-legal.md` (por si cambiaron), y regenerar estos 6
archivos desde cero — no editar a mano sobre el kit anterior, para evitar que quede una mezcla de datos
viejos y nuevos.
