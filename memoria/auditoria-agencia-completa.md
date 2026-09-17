---
fecha: 2026-09-11
tipo: Auditoría de Modo y Agentes (Oficina de Estrategia)
solicitado_por: Jaime (Modo Jefe)
---

# AUDITORÍA DE MODO Y AGENTES — OFICINA DE ESTRATEGIA

> Este documento responde SOLO a la ORDEN 1 (auditoría de modo y agentes) pedida en "Modo Jefe".
> La prueba de fuego con datos de mercado real de GECKO (competidores, FODA, verificación legal/técnica
> contra fuente oficial MSP/ACESS) se movió por orden expresa a `clientes/gecko-acabados-hospitalarios/`
> — este archivo es memoria de LA AGENCIA (el equipo de 18 agentes), no de ningún cliente específico.

---

## 1.1 — ¿MODO ABIERTO o amarrado a un proyecto?

**Respuesta corta: los 18 agentes SÍ están amarrados a este proyecto (war-room-holding-os), y eso es
correcto y necesario — pero hay que separar dos cosas distintas que la pregunta mezcla.**

**Cosa 1 — Equipo Abierto (generalista de rubro): ✅ Verificado, intacto.**
Los 18 agentes no tienen ningún negocio hardcodeado. Todos leen `memoria/ideas/IDEA-ACTUAL.md` para
saber de qué idea/negocio se habla en cada momento. Esto se verificó por primera vez hace varias
sesiones (grep sin resultados de rubros específicos fuera de los ejemplos ilustrativos) y se reforzó
con `memoria/PRINCIPIOS-DEL-EQUIPO.md` (Ley Suprema) y `memoria/sistema.md` (personalidad brutal). En
este sentido, **sí están en modo abierto**: pueden analizar pisos, un restaurante, un SaaS, lo que sea.
Con la nueva carpeta `clientes/`, este principio se refuerza más: cada cliente vive aislado en su
propia carpeta y ningún agente debe mezclar datos de un cliente con otro.

**Cosa 2 — Alcance técnico (agentes de proyecto vs. agentes globales del usuario): amarrados, por diseño.**
Los 18 archivos viven en `.claude/agents/` **dentro del repositorio** `war-room-holding-os`. Eso los
hace agentes de **proyecto**, no agentes **globales** del usuario. La diferencia importa así:

- Se verificó que en el entorno de nube, `$HOME` (`/root`) es una carpeta completamente distinta del
  repo (`/home/claude`), propiedad del sistema (hooks, sesiones, credenciales) — **no** es un lugar
  donde deban vivir agentes de usuario, y no existe ahí ningún `.claude/agents` global.
- Se intentó verificar lo mismo en el Mac vía el puente de dispositivo remoto: **no se pudo**, porque
  ese puente corre en una VM aislada con su propio `$HOME` separado (no es el Mac real), así que no
  tiene visibilidad de la carpeta `~/.claude/agents` real tampoco.
- Conclusión honesta: **no se puede "desamarrar" los agentes de verdad hacia un `~/.claude/agents` global
  real desde este puente**, porque no hay acceso de escritura al directorio de usuario real del Mac (solo
  a la carpeta `Downloads` autorizada). Lo que sí se puede confirmar es que, dentro del proyecto,
  los agentes son 100% portables: cualquier copia completa del repo (como esta misma, y la de GitHub)
  los trae consigo, listos para funcionar, porque `memoria/` y `.claude/agents/` viajan juntos.
- **Por qué esto es correcto y no un defecto a "arreglar":** cada agente depende de leer
  `memoria/ideas/IDEA-ACTUAL.md`, `memoria/PRINCIPIOS-DEL-EQUIPO.md` y `memoria/sistema.md` con rutas
  relativas. Si estuvieran "sueltos" en un directorio global sin ese `memoria/` al lado, no sabrían nada
  — serían personas sin memoria. La Oficina de Estrategia es un sistema (agentes + memoria), no agentes
  sueltos. Desacoplarlos del proyecto los rompería, no los liberaría.

**Si lo que se quiere es poder invocarlos desde CUALQUIER carpeta del Mac (no solo parado dentro de
`war-room`):** la forma correcta es copiar los 18 `.md` al `~/.claude/agents/` real del Mac (fuera de
este puente, directamente en el equipo) y cambiar sus referencias de `memoria/...` a una ruta absoluta
fija (ej. `~/Downloads/war-room/memoria/...`). Queda pendiente de confirmación antes de ejecutarlo,
porque cambia cómo funcionan los agentes.

---

## 1.2 — Los 18 agentes: qué saben hacer, qué tienen conectado, su límite hoy

Todos los 18 tienen exactamente el mismo nivel de acceso a herramientas — este es en sí mismo un
hallazgo (ver más abajo): **no existe hoy ninguna diferenciación de permisos o integraciones por rol.**
Cualquier agente puede, en teoría, usar cualquier herramienta de la sesión (Canva, web, bash, archivos).
Ninguno tiene una integración *propia y exclusiva* (ej. el de Marketing no tiene su propia cuenta de
Meta Ads; el de Finanzas no tiene una hoja de cálculo conectada de verdad).

| # | Agente | Qué sabe hacer hoy (su marco) | Herramientas conectadas | Límite actual |
|---|---|---|---|---|
| 1 | **director-estrategia** | Canvas (Osterwalder), Good Strategy (Rumelt), Playing to Win, Blue Ocean — decide modelo de negocio y estrategia | Genéricas de sesión (sin integración propia) | No tiene autoridad real de ejecución; solo redacta análisis en texto |
| 2 | **agente-pesimista** | Good Strategy, Taleb (punto único de falla), Premortem (Klein), Porter-proveedores — riesgo y devil's advocate | Genéricas | No valida datos externos por sí mismo salvo que se le pida buscar; puede repetir supuestos sin verificar |
| 3 | **agente-finanzas** | Canvas, Lean Analytics, Profit First — CAC/LTV, unit economics | Genéricas | Sin acceso a datos financieros reales (no hay contabilidad/banco conectado); todo número es estimado, no auditado |
| 4 | **agente-analista** | Canvas, Jobs to be Done, TAM/SAM/SOM | Genéricas + puede pedir WebSearch si se le indica | Sin fuente de datos de mercado propia (INEC, cámaras de comercio); depende de que alguien le pida buscar |
| 5 | **agente-marketing** | Canvas, Contagious (Berger), 22 Leyes, StoryBrand | Genéricas + Canva (a nivel de sesión, no exclusivo del agente) | No tiene cuenta de Meta/Google Ads conectada — no puede publicar ni medir resultados reales, solo crear el arte |
| 6 | **agente-compras-procurement** | Kraljic Matrix, Porter-proveedores | Genéricas | Sin acceso a ERP/inventario real; no puede cotizar proveedores en vivo |
| 7 | **agente-operaciones** | Canvas, Theory of Constraints (Goldratt), Checklist Manifesto (Gawande) | Genéricas | Sin conexión a un sistema operativo real (no hay pipeline/kanban de producción conectado) |
| 8 | **agente-legal** | Gestión de Riesgo Contractual, Getting to Yes | Genéricas + WebSearch si se pide | No es abogado certificado en Ecuador; no verifica normas oficiales a menos que se le ordene explícitamente |
| 9 | **agente-talento** | Costo de Rotación/Engagement, Taleb | Genéricas | Sin HRIS conectado; no tiene datos reales de nómina/rotación |
| 10 | **agente-cliente** | NPS/Churn | Genéricas | Sin CRM conectado — no puede leer NPS/churn real, solo modelarlo hipotéticamente |
| 11 | **agente-producto** | Kano Model | Genéricas | Sin backlog/roadmap tool conectado |
| 12 | **agente-tecnologia** | Build vs. Buy, Profit First | Genéricas | No tiene acceso a stack técnico real del negocio para auditarlo |
| 13 | **agente-closer** | SPIN Selling, Getting to Yes | Genéricas | Sin CRM/teléfono conectado — diseña guiones, no los ejecuta ni mide conversión real |
| 14 | **marketing-copywriting** | StoryBrand, Cialdini, 22 Leyes | Genéricas + Canva | No prueba A/B nada; no mide qué copy convierte más |
| 15 | **marketing-paid-media** | Lean Analytics, 22 Leyes | Genéricas + Canva | **No tiene Meta/Google Ads Manager conectado** — no puede pautar, pujar ni ver métricas reales (CPM, CTR, CPL) |
| 16 | **marketing-social-organic** | Contagious (Berger) | Genéricas + Canva | No publica directo a redes (no hay Meta Business Suite/Buffer conectado) |
| 17 | **marketing-seo-content** | Topic Clusters, Jobs to Be Done | Genéricas + WebSearch si se pide | No tiene Google Search Console/Ahrefs/SEMrush conectado — no ve posiciones ni tráfico real |
| 18 | **marketing-crm-retention** | Hooked (Nir Eyal), Lean Analytics | Genéricas | Sin CRM/email marketing conectado (no hay HubSpot/Mailchimp) — diseña flujos que nadie ejecuta automáticamente |

**Conexión real y verificada hoy:** solo **Canva** (para artes) y **WebSearch/WebFetch** (cuando el
Director decide buscar — no es autónomo por agente) y el propio sistema de archivos (`memoria/` y ahora
`clientes/`). Todo lo demás (Meta Ads, CRM, ERP, contabilidad, HRIS, SEO tools) es **cero** — el equipo
razona con frameworks y redacta, pero no ejecuta ni mide en el mundo real todavía.

---

## 1.3 — Qué falta para pasar de "equipo básico" a agencia de nivel mundial

Sin filtro, en orden de impacto:

1. **Conexión a medios pagados real (Meta Ads Manager / Google Ads API).** Hoy se crean artes bonitos en
   Canva, pero nadie los publica, puja presupuesto ni mide CPL/CPA real. Sin esto, "Marketing" es una
   imprenta, no una agencia de performance.
2. **CRM real (HubSpot, Pipedrive, o el que sea) conectado.** Los agentes de Cliente, Closer y
   CRM-Retention diseñan estrategia sobre un cliente hipotético. Sin un CRM conectado no hay leads reales
   que nutrir ni pipeline que medir — el "cierre de ventas" es teatro sin datos.
3. **Datos de mercado con fuente, no solo redacción.** Analista y Pesimista deberían poder disparar una
   búsqueda web por sí mismos, no solo cuando el Director se los pide manualmente.
4. **Contabilidad/finanzas real conectada** (ej. un Excel/Sheets vivo, o QuickBooks) para que Finanzas
   deje de estimar unit economics de memoria y empiece a auditar números reales del negocio.
5. **Diferenciación de permisos por agente (least privilege).** Hoy los 18 tienen exactamente el mismo
   acceso genérico. Una agencia real no le da a Legal el mismo alcance que a Marketing.
6. **Memoria de resultados, no solo de planes.** El sistema guarda estrategias y análisis, pero no guarda
   *qué pasó después* (¿se instaló el piso?, ¿cerró la venta?, ¿qué CPL tuvo el anuncio?). Sin ese loop
   de retroalimentación, el equipo nunca aprende de sus propias decisiones.
7. **Verificación regulatoria/legal con fuente primaria por defecto.** El equipo puede citar una norma
   sin haberla verificado en la fuente oficial a menos que se le ordene explícitamente — debería ser
   automático para Legal, no opcional. (Ejemplo real de por qué esto importa: ver
   `clientes/gecko-acabados-hospitalarios/detalle-tecnico-legal.md`.)
8. **Inteligencia de mercado compartida entre clientes/ideas, no solo dentro de una sola carpeta** — una
   agencia de verdad acumula conocimiento de mercado reutilizable (ej. "cómo compite el sector de
   materiales de construcción en Ecuador") en vez de que cada cliente empiece de cero.

---

## Estructura de memoria (actualizada tras la orden de organización)

- `memoria/` — memoria de LA AGENCIA: principios, personalidad del sistema, literatura/frameworks,
  ideas en evaluación (`memoria/ideas/`) y auditorías del propio equipo (este archivo).
- `clientes/<nombre-cliente>/` — memoria AISLADA de un cliente activo específico (brand, producto,
  detalle técnico-legal, procesos). No se mezcla entre clientes ni se referencia como ejemplo genérico
  en `memoria/literatura/`.
