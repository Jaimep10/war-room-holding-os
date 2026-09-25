# Cuarto de Diseño de Muebles

Dashboard **separado** del War Room (`../dashboard/`). Cubre el flujo de diseño
físico de muebles modulares (cocinas, closets, etc.) sobre SketchUp + KSmart,
pedido por el usuario el 24/25-sep-2026 — ver `../memoria/PROPUESTA-vertical-diseno-muebles-sketchup.md`
para el diseño completo de la vertical.

## Por qué es un proyecto aparte

- No comparte código, componentes ni rutas con `dashboard/` (War Room).
- No comparte agentes: los suyos viven en `.claude/agents/cuarto-diseno-muebles/`,
  no en el listado plano de los 20 agentes del War Room.
- Sí comparte la convención de memoria de cliente `clientes/[cliente]/`, porque
  es la misma agencia y los mismos clientes pueden pedir varios servicios.

## Los 5 agentes de este cuarto

1. `agente-director-cuarto-muebles` — coordinador único, arma el entregable final.
2. `agente-interprete-planos` — lee el plano a mano alzada, levanta arquitectura base.
3. `agente-arquitecto-espacio` — define el uso del espacio (triángulo de trabajo si es cocina).
4. `agente-ksmart-ejecutor` — arma el mueble con los módulos reales de la carpeta local de KSmart.
5. `agente-presupuesto-mueble` — lista de materiales + presupuesto final.

Cada uno guarda su resultado en `clientes/[cliente]/outputs/muebles/`.

## MVP: sin API de KSmart, sin automatizar SketchUp

Por instrucción explícita del usuario (25-sep-2026): KSmart en este MVP es una
**carpeta local de módulos** (editable/configurable por proyecto), no una GUI
que haya que automatizar ni una API. El inventario real (colecciones,
módulos, plantillas, plugins, fuente de precios) y sus rutas viven en
`config/ksmart.md` — las rutas siguen provisionales (`~/Downloads/`) mientras
se confirma la carpeta definitiva.

## Base de conocimiento (`.claude/knowledge/cuarto-diseno-muebles/`)

`agente-ksmart-ejecutor` lee SIEMPRE, en cada despacho y sin cachear, desde
disco:
- `principios-diseno-cocinas.md` — triángulo de trabajo, alturas ergonómicas,
  y los 3 niveles de reglas de diseño (oro / optimizable / excepción humana).
- `catalogo-ksmart-modulos.md` — versionado y actualizable: tiene un
  encabezado "Última actualización" y una sección "Historial de colecciones"
  donde queda registrado cada `.zip` que se integra o actualiza. Cuando el
  usuario avisa "hay carpeta/colección nueva de KSmart", lo único que hace
  falta es actualizar este `.md` (agregar la fila real del módulo + la
  entrada en el historial) — el agente lo relee fresco en su próximo
  despacho, sin tocar código.
- `sketchup-buenas-practicas.md` — cómo organizar el modelo para que
  OpenCutList y los renders/planos salgan bien.

## Ejecución manual y parcial (borrador vs. completo)

El dashboard nunca dispara las 4 partes de una sola vez. Por cliente/proyecto
hay 4 checkboxes (Cortes, Presupuesto, Renders, Planos) y 2 botones:

- **Ejecutar Borrador** → siempre pide ÚNICAMENTE el `.skp`, ignorando lo que
  esté tildado en los checkboxes (nunca calcula cortes, presupuesto, renders
  ni planos en este modo).
- **Ejecutar Completo** → pide las partes que estén tildadas en ese momento
  (puede ser parcial, ej. solo Cortes + Planos), pero si el borrador de ese
  proyecto todavía no fue aprobado, `agente-director-cuarto-muebles` igual se
  detiene después del `.skp` con `BORRADOR_LISTO: ¿Apruebas para
  entregables?` — el botón no salta ese gate.

Los botones escriben la solicitud en
`clientes/[cliente]/[tipo-proyecto]/ejecucion.json` — no ejecutan ningún
agente por sí mismos (no hay un backend corriendo los agentes en segundo
plano). Es `agente-director-cuarto-muebles`, al ser invocado, quien lee ese
archivo y hace el trabajo real, incluyendo pausar y esperar que el usuario
apruebe (desde el chat o desde el botón "Sí, apruebo" que aparece en el
dashboard cuando el borrador está listo).

## OpenCutList y el entregable físico

El flujo real de diseño termina en `agente-ksmart-ejecutor` ejecutando
OpenCutList sobre el modelo terminado, y entregando 4 partes por proyecto en
`clientes/[cliente]/[tipo-proyecto]/` (ej. `cocina/`, `closet/`):
`.skp` armado, `cortes/` (despiece real de OpenCutList), `renders/` (3-5
vistas) y `planos/` (layout 2D con medidas para taller). El presupuesto de
`agente-presupuesto-mueble` se calcula sobre el despiece REAL de `cortes/`,
no sobre un estimado.

## Correr el dashboard

```bash
npm install
npm run dev
```

Corre en `http://localhost:3100` (puerto distinto al del War Room, que usa el
3000 por defecto de Next, para poder tener los dos abiertos a la vez).

## Qué hace hoy

Es un tablero de estado: lista los clientes de `clientes/` y, para cada uno,
marca qué etapas de este flujo ya tienen archivo de salida real. No dispara
los agentes por sí mismo todavía (eso se hace invocando al agente
correspondiente sobre el cliente activo) — el dashboard solo refleja el
progreso real que esos agentes van dejando en disco.
