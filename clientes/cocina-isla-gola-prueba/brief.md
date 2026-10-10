# Brief — cocina-isla-gola-prueba

> Proyecto de prueba del Cuarto de Diseño de Muebles. El usuario mandó el plano
> (`plano-original.webp`, imagen de Pinterest) el 09-oct-2026 y pidió: **modelo
> GOLA, cajones en la parte de abajo y cajones internos "en los superiores"
> para cucharas y utensilios**. Este archivo tiene solo lo que se lee en el
> plano o lo que dijo el usuario. Lo que falta está en **Pendientes**, sin rellenar.
> El nombre de la carpeta es provisional: se cambia cuando haya un cliente real.

- **Tipo de proyecto:** cocina en L con isla central
- **Colección:** KSmart **GOLA** (`2.COLECCION KSMART GOLA-20260316T021334Z-3-001.zip`), tabla GOLA del catálogo
- **Módulos candidatos extraídos:** `cocina/modulos/` (cajoneras, `CBA.60`, `CB.PGL.40.1K`, torres de hornos, altos `CAR.FP.60.*`, zócalos)

## Medidas leídas del plano (cm)

| Elemento | Medida | Nota |
|---|---|---|
| Cuarto | 360 de ancho × ~419 de fondo | 300 + 60 arriba; 76.3 + 209.5 + 133.3 a la izquierda = 57 + 267 + 95 a la derecha |
| Pared de arriba | 5 módulos × 60 = 300 | Encimera + "armarios superiores"; fregadero doble entre el 3.º y el 4.º módulo, aprox. |
| Esquina de arriba a la derecha | 60 × 57 | Cuadro oscuro, mismo relleno que los muros |
| Pared derecha, de arriba hacia abajo | 102 + 60 + 105 + 95 libre | Bloque horno/microondas/almacenaje · nevera · estantería vista (~40 de fondo) |
| Isla | 162 × 93.5 | A 116 de la encimera de arriba; 69 a la pared izquierda; 69 al frente de las torres (89 a la estantería) |
| Placa de la isla | 66.7, centrada (47.6 / 47.7 a los lados) | "isla central, zona fuegos, armarios en la parte inferior" |
| Pared izquierda | Abertura de 209.5 | Empieza a 76.3 de la pared de arriba; sin muebles |

## Respuestas del usuario (09-oct-2026)

- **Cubertero** en los muebles bajos (accesorio dentro del primer cajón; no es un módulo KSmart).
- **Fregadero:** puerta con **basurero** abajo.
- **Isla:** módulos **de un solo lado**, al frente.
- **Junto a la torre de hornos:** "tú decide" → el agente eligió un cajón de 40 (`CB.PGL.40.1K`) como apoyo al lado del horno + 2 cm de holgura.
- **Nevera:** empotrada (con paneles laterales).
- **Techo:** 250 cm.

## Decisiones del agente (revisables)

1. **Fregadero:** GOLA no tiene mueble de puertas de 60, así que va `CBR.PGL.80.2PBM` (80, 2 puertas, basurero adentro). La pared de 300 queda 60 + 60 + 40 + 80 + 60, con el fregadero centrado en 200 (en el plano, ~181).
2. **Isla:** frente hacia el fregadero y barra de 33.5 detrás. 60 + 60 (placa) + 40 + 2 de holgura = 162. La placa queda centrada a 90 del borde izquierdo de la isla (en el plano, 81).
3. **Nevera, estantería vista y pilar:** van como guías, porque no son módulos KSmart.
4. **Altos:** propuesta de borde inferior a **143 cm**, para alinear arriba con las torres (223). Falta confirmar.

Plan: `outputs/muebles/plan-espacial.json` · Planta: `outputs/muebles/planta-propuesta.png`

## Elecciones del usuario (10-oct-2026, tras la inspección GOLA)

- **Cajonera 60 (5 lugares):** `CB.3G.GLM.60.K.2C` (2 cajones chicos arriba + 1 grande; cubertero en el 1.º).
- **Torre horno + micro:** `CLMH.PGL.60.1K.PBIM` (cajón abajo, hueco 45.5–150, puerta arriba).
- **Altos:** `CAR.FP.60.2PBM`, borde inferior a **143 cm** (arriba 223, alineado con la torre).

Borrador vigente: `cocina/cocina-isla-gola-prueba-cocina-v2.skp` (pared derecha corrida 3 cm, 0 cruces) · Vistas: `outputs/muebles/borrador-iso-v2.png`, `borrador-planta-v2.png` (v1: `borrador-iso.png`, `borrador-planta.png`)

## Pendientes

1. Borrador v2 **aprobado** (10-oct-2026). Falta definir qué entregables: cortes, presupuesto, renders y/o planos.
