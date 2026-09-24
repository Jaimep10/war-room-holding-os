# Estrellitas Day Care

> Este README se armó a partir de datos reales que el propio usuario ya cargó en
> `memoria/ideas/NEGOCIO-EXISTENTE-estrellitas-day-care.md` (modo "Mejorar Negocio
> Existente" del dashboard) — no se inventó ningún dato nuevo acá, solo se puentea
> ese diagnóstico ya real hacia el sistema de `clientes/` para que Acción Rápida y
> el resto del equipo lo puedan usar como memoria del cliente. Si algo de lo de
> abajo cambia o falta, actualízalo directo acá (es la memoria que van a leer los
> agentes cuando se trabaje sobre este cliente).

## Datos del negocio (declarados por el usuario)

- **Giro:** Servicios — guardería / cuidado infantil
- **Facturación mensual actual:** $10,000
- **Margen actual:** 20%
- **Número de empleados:** 4
- **Principal dolor declarado:** Ventas inestables

## Diagnóstico ya hecho por el equipo

El 22-Sep-2026 se corrió la Reunión de Mejora (Operaciones + Compras + Finanzas +
Talento + Cliente + Producto + Legal) sobre este negocio. Encontró, entre otras
cosas: capital inmovilizado en cuentas por cobrar, rotación de cuidadoras, churn
de familias que no renuevan, cupo instalado subutilizado (~7 cupos vacíos sobre
~24 de capacidad), servicios básicos sin resolver (horario/comunicación con
padres/alimentación) y contratos de servicio sin cláusulas clave de
responsabilidad/reembolso.

El detalle completo con montos estimados por área vive en
`memoria/ideas/NEGOCIO-EXISTENTE-estrellitas-day-care.md` — cualquier agente que
necesite el diagnóstico completo (no solo este resumen) debe leer ese archivo,
no asumir que este README alcanza.

## Fotos reales recibidas (24-sep-2026)

El usuario mandó 10 fotos reales del local por el chat. Están guardadas en
`clientes/estrellitas-day-care/assets/fotos/` — cualquier agente que arme la
web o el material creativo de este cliente debe usar ESTAS fotos, nunca stock
ni fotos genéricas de guardería:

- `patio-01-juegos-general.jpg` a `patio-06-columpio-cerca.jpg` — patio de
  juegos exterior (casita, tobogán, columpio, carritos, área de picnic).
- `salon-01-pizarra-horario.jpg` — salón con pizarra "School Squad", horario
  del día y calendario de septiembre 2026 a la vista.
- `salon-02-actividad-grupal.png` — cuidadora con niños haciendo una
  actividad en mesa.
- `evento-01-back-to-school-bebe.png`, `evento-02-back-to-school-nino.png` —
  decoración/evento de bienvenida "Back to School".

## Logo digitalizado (24-sep-2026)

El usuario mandó una foto del logo real impreso en una camiseta negra (fondo
oscuro, tela con textura). Se digitalizó quitando el fondo (segmentación por
saturación de color + flood-fill para no perder texto/detalles) y se guardó
en `clientes/estrellitas-day-care/assets/branding/estrellitas-logo.png` —
PNG con transparencia real, listo para web/impresos. Cualquier agente que
necesite el logo de este cliente usa ESE archivo, nunca lo redibuja ni
inventa una versión propia.

Nota honesta sobre una limitación técnica: en la foto original, la estrella
tiene una sombra/silueta oscura detrás que en la tela negra se funde casi
por completo con el fondo (muy poco contraste), así que no se pudo
reconstruir con confianza algorítmica y se omitió en la versión digital
(la estrella quedó "plana", sin esa sombra). Si el usuario confirma que esa
sombra es parte intencional del diseño, se puede volver a agregar a mano
como mejora de diseño — por ahora no se inventó, se dejó fuera.

## Primera versión de la web (24-sep-2026)

Se publicó un primer borrador del sitio (una sola página) usando SOLO
material real de este cliente: el logo digitalizado de arriba, las fotos
reales del local (patio, salón, evento "Back to School") y el horario real
tomado de la pizarra "Today's Schedule" del salón. Vive en
`clientes/estrellitas-day-care/outputs/web-preview.html` y está publicado
como Artifact privado del usuario.

También existe un segundo entregable, hecho por el agente `agente-web-wordpress`,
en `clientes/estrellitas-day-care/outputs/web-wordpress-ejemplo.md`: el mismo
contenido pero en bloques nativos de Gutenberg, listo para importarse a un
WordPress real vía `crearPaginaWordpress()` (siempre como borrador, nunca
publicado automáticamente).

## Datos reales de contacto/operación confirmados (24-sep-2026)

El usuario confirmó estos datos reales por chat — ya se pueden usar en
cualquier pieza de este cliente, dejaron de ser "falta completar":

- **Dirección:** 132-31 114th Street, South Ozone Park, NY, 11420.
- **Horario de atención al público:** 7:00 am a 6:00 pm.
- **Edades que se atienden:** desde los 2 meses hasta los 10 años.
- **Trayectoria:** más de 20 años en el rubro.
- **Metodología:** lúdica — "los niños aprenden jugando".

## Falta completar (pedir al usuario, no inventar)

- **Teléfono / WhatsApp de contacto** — todavía no confirmado. Es un bloqueo
  real para el botón de CTA de WhatsApp que pidió el usuario: sin el número
  real, ese botón no puede armarse (no se inventa un número de ejemplo).
- Tarifas y proceso de inscripción.
- ¿Dominio y hosting ya existen, para conectar esto a `/api/hostinger/deploy`?
- Confirmar si la paleta de colores del logo (amarillo, celeste, coral,
  naranja) es la identidad oficial de la marca más allá del logo mismo.
- Confirmar si la sombra detrás de la estrella (ver nota arriba) debe
  reincorporarse al logo digital.
