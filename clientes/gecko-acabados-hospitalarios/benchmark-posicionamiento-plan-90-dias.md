# Benchmark, Posicionamiento y Plan 90 Días — GECKO Acabados Hospitalarios

> Generado por director-estrategia (GERENTE GENERAL) a partir de PAYLOAD del usuario. Benchmark de competencia investigado en vivo con WebSearch/WebFetch — ver notas de "sin dato público verificable" donde aplica. No inventar cifras nuevas sobre esta lista de competidores sin volver a investigar.

## 0. Corrección de dato técnico (obligatoria antes de usar este documento)

El brief original pedía validar contra "norma IEC 61340". Los documentos ya verificados del cliente (`detalle-tecnico-legal.md`, contrastado con la Guía de Acabados Interiores para Hospitales del MSP y la guía de infraestructura de ACESS) NO citan IEC 61340 — citan **EN1081** (≤10⁶Ω en quirófano, ≤10⁹Ω en Rayos X, sin ohmiaje fijo en UCI), bajo autoridad de inspección **ACESS** (Acuerdo Ministerial 00032-2020). Se usa EN1081/ACESS en todo este documento por ser el dato real y verificado en fuente oficial ecuatoriana.

También hay una tensión pendiente de resolver con Operaciones: el brief dice "cobertura nacional en todo el Ecuador", pero `procesos-instalacion.md` solo confirma 72h de instalación en Quito y Guayaquil — fuera de esas dos ciudades el tiempo no está definido. Un arquitecto que especifica para un hospital fuera de esas ciudades va a preguntar esto exacto (ver pase a Operaciones más abajo).

## 1. Benchmark real — Forbo vs Casa Guzmán vs Neoconstru vs IPAE vs Campaign (Ecuador)

| Competidor | Qué se encontró (fuente pública) | Cómo se posiciona | Cómo cobra | Qué promete |
|---|---|---|---|---|
| **Forbo** | Sitio corporativo global (forbo.com), sin distribuidor local propio verificable en Ecuador con ficha de precios. Línea "salas húmedas" para sanitario/geriátrico. | Premium, técnico-aspiracional ("creating better environments"). Vende linóleo natural (Marmoleum), no vinilo. Certificaciones de tráfico/deslizamiento (R10-R12) mencionadas; sin certificación de conductividad hospitalaria específica visible para Ecuador. | No publica precio — modelo de especificación + importación, se negocia por proyecto/distribuidor. | Reputación de marca suiza, durabilidad, estética. Sin caso de éxito hospitalario ecuatoriano publicado ni ficha de cumplimiento normativo local (GAIH/ACESS). |
| **Casa Guzmán** | Listado en Construex (marketplace B2B de materiales de Ecuador): "Piso de vinil en rollo conductivo". Sin landing propia especializada. | Ferretero/distribuidor generalista. Producto de catálogo, sin ficha de norma, ohmiaje ni caso hospitalario. | Venta por m² como commodity — lógica de precio de lista, no proyecto llave en mano. | Ninguna promesa técnica diferenciada visible. |
| **Neoconstru** | Sitio propio con SEO dedicado a pisos hospitalarios. Distribuidor de la marca norteamericana **INOFLOOR**, presente en Ecuador desde 2010. | Especialista en pisos hospitalarios (quirófano, Rayos X, UCI, salas blancas, centros de datos), con contenido educativo. Cobertura declarada: Quito, Guayaquil, Cuenca y otras ciudades. | No publica precio. Ofrece "inspección gratuita" como gancho de embudo comercial. | Asesoría personalizada, instalación por técnicos capacitados, "certificados de calidad y origen" mencionados de forma genérica (sin norma específica citada). Es el competidor con marketing de contenidos más desarrollado de los cinco. |
| **IPAE** | Sin dato público verificable — no aparece ninguna empresa ecuatoriana de acabados/pisos hospitalarios con ese nombre. | Sin dato. | Sin dato. | Sin dato. |
| **Campaign** | Sin dato público verificable — no aparece ninguna empresa "Campaign" vendiendo pisos hospitalarios en Ecuador. | Sin dato. | Sin dato. | Sin dato. |

**Lectura estratégica:**
- El rival real de fondo es **Neoconstru/Inofloor**, no Forbo: mismo terreno de juego (vinilo conductivo hospitalario, mismo público, mismo canal digital), con 15+ años de ventaja en SEO/contenido y cobertura multi-ciudad ya declarada.
- Forbo compite en prestigio de marca + material noble, no en especificación normativa ecuatoriana verificada — ahí es donde GECKO puede golpear con precisión (EN1081 por área, verificado contra MSP/ACESS).
- Casa Guzmán no es amenaza de posicionamiento, es ancla de precio: arrastra hacia abajo la percepción de valor del mercado. La respuesta no es bajar precio, es sacar la conversación del m² y llevarla a "sistema certificado instalado".
- IPAE y Campaign: sin evidencia pública de actividad real en este nicho en Ecuador hoy. Si Jaime los enfrenta en campo (referidos, licitaciones), esa información puntual debe venir de él o del equipo comercial — no es buscable en la web.

## 2. Posicionamiento ganador para GECKO

**No competir por precio por m². Competir por "responsabilidad de auditoría transferida".**

> "GECKO no vende piso. Entrega el sistema de piso conductivo/antiestático que ACESS audita por área, con la especificación exacta documentada — para que la responsabilidad de que pase la inspección deje de ser suya."

Tres pilares (todos respaldados por lo ya verificado del cliente, nada inventado):
1. **Especificidad por área, no cifra genérica** — EN1081 ≤10⁶Ω quirófano vs ≤10⁹Ω Rayos X vs cualitativo UCI. Ni Forbo ni Neoconstru comunican esto públicamente con este nivel de detalle.
2. **Sistema instalado, no rollo vendido** — el ticket de $4,500/quirófano ya empaqueta suministro + instalación + curva sanitaria + termosellado + certificado, a diferencia del modelo de Casa Guzmán (m² suelto).
3. **Riesgo de auditoría transferido al proveedor** — el ángulo del battlecard existente ("una junta que falla en auditoría de ACESS") funciona para mantenimiento; para arquitectos se traduce en "usted no defiende esta especificación solo, nosotros se la documentamos".

**Vacío real identificado:** el battlecard actual habla al comité de compra (Compras + Mantenimiento). Falta el arquitecto que especifica en planos antes de que exista comité de compra — ese cliente hoy probablemente le llega a Forbo (prestigio) o a Neoconstru (SEO), no a GECKO.

## 3. Plan de 90 días — quitarle especificación a Forbo con arquitectos

**Objetivo:** al menos 3 arquitectos/estudios de arquitectura hospitalaria tengan la ficha técnica de GECKO en su biblioteca de especificación antes del día 90, y 1 proyecto en etapa de diseño incluya a GECKO como especificado (no cotizado a última hora).

**Días 1-30 — Construir la munición que hoy no existe**
- Ficha técnica por área (quirófano/Rayos X/UCI) citando EN1081 y fuente oficial GAIH-MSP + ACESS, formato PDF de especificación. Bloqueante: completar en `procesos-instalacion.md` condiciones de subbase, si el área debe cerrarse, conexión a tierra.
- Definir con el equipo técnico el alcance real de instalación fuera de Quito/Guayaquil.
- Levantar 1 caso de instalación ya hecha como caso documentado con fotos técnicas (hoy no existe ninguno).
- Resolver identidad visual (tipografía, logo pendiente) antes de material dirigido a arquitectos.

**Días 31-60 — Presencia donde el arquitecto decide**
- Landing técnica mínima: fichas por área descargables, caso de éxito, certificación, sin precio de venta directa.
- Visitar directamente 8-10 estudios de arquitectura hospitalaria/constructoras en Quito y Guayaquil con la ficha técnica ("vamos a especificar juntos", no "vengo a vender rollo").
- Participar/patrocinar 1 espacio gremial (colegio de arquitectos, evento de infraestructura de salud).

**Días 61-90 — Convertir contacto en especificación activa**
- Cerrar al menos 1 "auditoría piloto" en un proyecto en etapa de diseño, adaptando el guion del battlecard a arquitecto.
- Publicar contenido técnico para arquitectos (revisar `kit-redes/` para quitar "IEC 61340" y cifras de quirófano repetidas en Rayos X/UCI).
- Medir cuántos arquitectos tienen la ficha en su carpeta de especificación — ese es el indicador real, no likes de Instagram.

## 4. Pase obligatorio a especialistas (ya despachado)

Este análisis generó dos payloads de handoff, enviados a `agente-operaciones` y `agente-marketing`, cubriendo respectivamente: huecos de cobertura/instalación/garantía que deben cerrarse antes de prometerle algo a un arquitecto, y el brief de contenido/piezas de los 90 días con las correcciones normativas obligatorias (EN1081, no IEC 61340; no repetir ohmiaje de quirófano en otras áreas).
