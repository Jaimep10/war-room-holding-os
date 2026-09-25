# Brief — cocina-demo-prueba

> Cliente de prueba para el Cuarto de Diseño de Muebles. Todos los datos los
> dio el usuario en chat el 25-sep-2026 (4 rondas). Nada de este archivo es
> inventado: lo que falta está en la sección **Pendientes**, no rellenado.

- **Tipo de proyecto:** cocina en U
- **Layout interactivo:** `cuarto-diseno-muebles/layout-cocina-u.html`
- **Layout en JSON:** `outputs/muebles/plan-espacial.json` (generado desde el mismo canvas)
- **Catálogo usado:** solo los 92 módulos `.skp` de los zips de KSmart en `~/Downloads/`
  (1.MODULOS BAJOS, 2.MODULOS ALTOS, 3.MODULOS TORRES)

## Espacio

| Lado | Qué es | Medida | Lleva |
|---|---|---|---|
| Pared A | izquierda, muro | 2.70 m | fregadero |
| Pared B | fondo, muro | 2.30 m | torre de hornos |
| C | derecha, **península desayunador abierta (no es muro)** | mueble de 2.30 m | refri al final |

- Sin ventana ni puerta.
- Sin puntos de agua ni gas conflictivos.
- Profundidades: **bajos y torres 60 cm**, **altos 35 cm**.
- Triángulo de trabajo: fregadero (A), cocción/torre de hornos (B), refri (C).

## Decisiones del usuario

1. Esquina A/B: **CBECRD.TI.80, esquinero en L de 80×80** (80 cm sobre A y 80 cm sobre B). Se quitó CBED.TI.90.
2. 50 cm sobrantes de la Pared A: **espacio libre para lavavajillas futuro**. CBA.50 no existe en KSmart.
3. Esquina B/C libre, sin esquinero. C arranca después del fondo de B.
4. Pared B: solo **CLMH.TI.60 + CBF1G1P.TI.80**. Sin el recto de 60 y sin altos sobre la torre. El espacio que sobra queda como holgura de ajuste.
5. Alto CAEC.SP.120 movido de la Pared B a la **Pared A, encima del CBECRD.TI.80**.
6. Variantes: CLRF.FP.80 → **2PBAV**, CAR.FP.60 → **2PBAV**, CAEC.SP.120 → **2PBAV**.
7. La península mide 2.30 m y sobresale 20 cm más allá de la Pared A. **Aceptado** como volado extra del desayunador.
8. Orden de la península: **CBA.60 (lado cocina) → volado de 90 → CLRF.FP.80 (refri al final)**. El volado se subió de 60 a 90 para cerrar los 230 cm.
10. La holgura de 10 cm de la Pared B va **contra la esquina C**.
9. Para otras cocinas, un recto de 60 sería CB.2G.TI.60.2K o CB.4G.TI.60.4C. En esta U no va.

## Módulos (izquierda → derecha mirando cada pared desde adentro)

**Pared A — 270 cm (cierra exacto)**

| Desde–hasta | Código | Archivo KSmart | Nota |
|---|---|---|---|
| 0–50 | — | — | Espacio libre, lavavajillas futuro |
| 50–110 | CBA.60 | CBA.60.skp | Fregadero |
| 110–190 | CBR.TI.80 | CBR.TI.80.2PBM.skp | |
| 190–270 | CBECRD.TI.80 | CBECRD.TI.80.PBIM.skp | Esquinero en L; su otra pata ocupa 0–80 de B |

Altos A:

| Desde–hasta | Código | Archivo KSmart | Nota |
|---|---|---|---|
| 50–110 | CAR.FP.60 | CAR.FP.60.2PBAV.skp | Encima del fregadero |
| 150–270 | CAEC.SP.120 | CAEC.SP.120.2PBAV.skp | Esquinero alto, recto, contra la esquina A/B (confirmado) |

**Pared B — 230 cm (0–80 es la pata en L del esquinero de A → 150 cm útiles)**

| Desde–hasta | Código | Archivo KSmart | Nota |
|---|---|---|---|
| 80–140 | CLMH.TI.60 | CLMH.TI.60.2PBIM.skp | Torre de hornos, sin altos encima |
| 140–220 | CBF1G1P.TI.80 | CBF1G1P.TI.80.skp | Mixto gaveta + puerta |
| 220–230 | — | — | Holgura de ajuste de 10 cm, contra la esquina C |

Sin altos en B.

**Península C — 230 cm (cierra exacto; arranca a 60 cm del fondo y termina a 290 cm)**

| Desde–hasta | Código | Archivo KSmart | Nota |
|---|---|---|---|
| 60–120 | CBA.60 | CBA.60.skp | Lado cocina |
| 120–210 | — | — | Volado desayunador, 90 cm |
| 210–290 | CLRF.FP.80 | CLRF.FP.80.2PBAV.skp | Refri |

## Triángulo de trabajo (medido desde el frente de cada módulo)

| Lado | Distancia | Rango NKBA 1.20–2.70 m |
|---|---|---|
| Fregadero → torre de hornos | 1.39 m | ok |
| Torre de hornos → refri | 1.99 m | ok (se cumple el mínimo de 1.20 m que pidió el usuario) |
| Refri → fregadero | 1.25 m | ok |
| **Total** | **4.63 m** | ok (4.00–7.90 m) |

## Pendientes

Ninguno bloqueante: no hay choques ni huecos sin resolver.

- **Aceptado:** holgura de 10 cm en la Pared B. El usuario había calculado 30, pero con el esquinero en L de 80×80 quedan 150 cm útiles.
- **Aceptado:** la península sobresale 20 cm más allá de la Pared A, como volado extra del desayunador.
- **Confirmado:** CAEC.SP.120 va recto, 120 cm sobre A contra la esquina A/B.
