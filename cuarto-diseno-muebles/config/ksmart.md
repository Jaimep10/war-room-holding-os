# Configuración de KSmart (módulos, plantillas, plugins y presupuesto)

> Este archivo es la única fuente de verdad sobre dónde viven los archivos
> reales de KSmart. `agente-ksmart-ejecutor` y `agente-presupuesto-mueble`
> leen este archivo antes de cada proyecto — nunca una ruta hardcodeada en su
> propio `.md` (eso rompería la regla de agencia abierta apenas cambie de
> equipo o de usuario).

## Estado: PROVISIONAL — carpeta exacta pendiente de confirmar

El usuario dio el inventario real de archivos (25-sep-2026) pero no la
carpeta exacta donde viven hoy — mencionó "`~/Downloads/` o donde los tenga".
Mientras no se confirme la carpeta real, tratá `~/Downloads/` como punto de
partida a verificar, nunca como un hecho ya confirmado: si al buscar ahí no
aparecen estos archivos, es NEEDS_CONTEXT ("¿en qué carpeta están hoy estos
archivos de KSmart?"), nunca asumir que se movieron o que no existen.

## Colecciones (.zip) — ruta provisional `~/Downloads/`

- `COLECCION KSMART GOLA.zip`
- `CLÓSETS.zip`
- `VESTIDORES.zip`
- `TIRADORES.zip`

## Módulos (.zip) — ruta provisional `~/Downloads/`

- `1.MODULOS BAJOS.zip`
- `2.MODULOS ALTOS.zip`
- `3.MODULOS TORRES.zip`
- `3.MODULOS TORRES 2.zip`

Ver `.claude/knowledge/cuarto-diseno-muebles/catalogo-ksmart-modulos.md` para
la tabla (todavía vacía) de módulos reales extraídos de estos zips.

## Plantilla/librería base de SketchUp

- **`PALETA KSMART 2026.skp`** (ruta provisional `~/Downloads/`) — esta es la
  **librería base de materiales/paleta** que `agente-ksmart-ejecutor` debe
  usar como punto de partida para texturas/materiales reales del proyecto.
  Nunca inventes un material que no esté en esta paleta — si el cliente pide
  un acabado que no está ahí, es NEEDS_CONTEXT.
- `1.PRE_PROYECTO COCINA#1.skp` (ruta provisional `~/Downloads/`) — plantilla
  de arranque para un proyecto de cocina (arquitectura/ejes ya preparados
  según la convención de KSmart). Usar como base cuando el proyecto sea una
  cocina nueva, en vez de empezar un `.skp` desde cero.

## Plugins de SketchUp instalados

- **`ksmart_kitchen_configurator.rbz`** — el plugin de configuración de
  módulos (esto es lo que hace que KSmart sea "editable/configurable por
  proyecto" y no una GUI genérica de SketchUp).
- **`ladb_opencutlist-7.1.0.rbz`** — OpenCutList, versión 7.1.0. Es lo que
  `agente-ksmart-ejecutor` ejecuta para generar el despiece real (`cortes/`).

Comportamiento específico de estos dos plugins (qué menú, qué botón, qué
opciones de exportación) NO se documenta acá de memoria — sale de
`sketchup-buenas-practicas.md` en la parte que sea genérica de SketchUp, y de
material real (video/manual) que el usuario comparta para lo que sea
específico del plugin. Si falta ese material al momento de operar el plugin,
es NEEDS_CONTEXT.

## Fuente real de precios para `agente-presupuesto-mueble`

- **`SuperMacroKmodular_V3_MacOS(rev.07.01.26).xlsm`** (ruta provisional
  `~/Downloads/`) — esta es la fuente real de precios/tarifas que
  `agente-presupuesto-mueble` debe usar, en vez de pedirle precios sueltos al
  cliente cada vez. Es un archivo Excel con macros (`.xlsm`): el agente lee
  las TABLAS/VALORES de precio reales que contiene (celdas de precio por
  material, herraje, tarifa de mano de obra, etc.), pero no ejecuta las
  macros de Excel. Si algún precio necesario depende de lógica que solo vive
  dentro de una macro (no de un valor de celda legible), eso es NEEDS_CONTEXT
  ("necesito que exportes ese cálculo a una tabla/CSV legible") — nunca se
  aproxima ese cálculo por fuera del archivo real.

## Historial de cambios
- 25-sep-2026: primera versión, ruta provisional recibida del usuario, sin
  inventario de archivos todavía.
- 25-sep-2026 (2): agregado el inventario real completo (colecciones,
  módulos, plantillas, plugins, fuente de precios) dado por el usuario. Sigue
  provisional la carpeta exacta (`~/Downloads/` es un punto de partida, no
  confirmado).
