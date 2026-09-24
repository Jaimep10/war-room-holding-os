# Web WordPress — ejemplo de página de Inicio (Estrellitas Day Care) — v2

> Generado por el Agente Web WordPress. Cliente activo: `estrellitas-day-care`.
> Fuente de datos: `clientes/estrellitas-day-care/README.md` (único origen de
> verdad, sección "Datos reales de contacto/operación confirmados") + el
> brief de `agente-marketing` para este mismo pedido (headline, subtítulos,
> bullets y texto de CTA) + las fotos reales en
> `clientes/estrellitas-day-care/assets/fotos/` + el logo digitalizado en
> `clientes/estrellitas-day-care/assets/branding/`. No se usó ningún dato,
> precio, dirección ni copy que no esté declarado en esas fuentes.
>
> Esta es la **v2** de este entregable: mejora directa sobre
> `web-wordpress-ejemplo.md` v1 (mismo archivo, sobrescrito). Ver el
> **Changelog** al final para el detalle exacto de qué cambió.

## Qué es esto y qué NO es

Esto es un **ejemplo de mi Capacidad 1**: contenido pensado para importarse
como una **página real de WordPress** vía `POST /wp-json/wp/v2/pages`
(`crearPaginaWordpress()` en `dashboard/lib/wordpress-site-client.ts`), no
una página HTML aislada. Es distinto del primer borrador
(`web-preview.html`, un Artifact independiente hecho por el orquestador):
ese es una vista previa visual; esto de acá es el **bloque de contenido
(`content`)** que se le pasaría a ese endpoint para crear la página en el
WordPress real del cliente, en cuanto exista dominio + Application Password
(`WP_ADMIN_USER` / `WP_ADMIN_APP_PASSWORD`) configurados.

Todavía no lo mandé al endpoint porque sigue faltando el teléfono/WhatsApp
real (bloqueo real para el botón de CTA) y todavía no sabemos si el
dominio/hosting del cliente ya están listos (ver "Lo que falta" abajo). El
endpoint además crea la página como **borrador (`draft`)** por defecto,
nunca publicada automáticamente.

## Por qué son bloques nativos de Gutenberg y no un solo bloque de HTML

Sigo usando `core/heading`, `core/paragraph`, `core/image`, `core/gallery`,
`core/columns`/`core/column`, `core/list`/`core/list-item`, `core/buttons`/
`core/button` y `core/group` — **cero `core/html` de bloque único**. El
usuario puede seguir editando cada foto, párrafo o botón a golpe de clic en
el editor de WordPress.

## Novedad importante: el pedido de "fotos que van cambiando" (carrusel/slider)

El usuario pidió que las fotos no queden solo en una galería estática en
grilla, sino que "vayan cambiando" (una especie de carrusel/slider
rotativo). Voy a ser honesto acá en vez de fingir que esto ya está resuelto
con bloques nativos:

**WordPress nativo (Gutenberg core) NO trae de fábrica un bloque de
carrusel/slider con auto-rotación.** El bloque `core/gallery` que usé abajo
es una **grilla estática** — muestra todas las fotos a la vez, no las va
rotando sola. No existe un `core/slideshow` en el core de Gutenberg (a
diferencia de lo que uno podría suponer). Decirte lo contrario sería
inventar una capacidad que WordPress no tiene.

Estas son las opciones reales, de más simple/editable sin código a más
compleja:

1. **(Recomendada) Plugin de slider, sobre el bloque `core/gallery` que ya
   armé.** Dos caminos posibles dentro de esta opción:
   - Si el sitio ya usa (o instala) **Jetpack**, este trae un ajuste nativo
     de "Tiled Galleries" / modo **Slideshow** que convierte una galería
     normal en un carrusel con flechas y auto-avance, configurable desde el
     mismo panel de bloque sin tocar código.
   - Si no se quiere Jetpack completo (trae muchas otras funciones), un
     plugin dedicado y liviano como **Smart Slider 3** o **MetaSlider**
     agrega un bloque de Gutenberg propio tipo "Carrusel" donde se eligen
     las fotos desde la Biblioteca de Medios y se configura tiempo de
     rotación, todo desde el editor visual, sin código.
   - Esta es la opción que recomiendo como principal porque el cliente
     puede después agregar o sacar fotos él mismo, sin depender de nadie
     que edite código.
2. **Bloque "Slideshow" nativo del tema (si el tema lo trae).** Algunos
   temas de bloques modernos (FSE, "Full Site Editing") incluyen su propio
   bloque de slideshow como parte del tema, no de WordPress core. Esto
   depende 100% de qué tema esté activo en el sitio real — no lo sabemos
   todavía porque no está confirmado el dominio/hosting.
3. **Bloque de código a medida (HTML/CSS/JS embebido) — último recurso, no
   recomendación principal.** Técnicamente se puede lograr un carrusel a
   mano con un bloque de código personalizado, pero esto rompe la regla que
   yo mismo seguí en la v1 de "cero `core/html` de bloque único": quedaría
   como una caja opaca que el cliente no puede editar por clic, y cualquier
   cambio futuro (agregar una foto, cambiar el tiempo de rotación) requiere
   que alguien vuelva a tocar código. Lo dejo documentado por transparencia,
   no porque lo recomiende.

**No puedo decidir cuál de las opciones 1 o 2 aplica hasta que se confirme
el dominio y qué plugins/tema están disponibles en el hosting real** — eso
ya está anotado como pendiente en el README ("¿Dominio y hosting ya
existen...?"). Mientras tanto, dejé el bloque `core/gallery` funcionando tal
cual (grilla estática real, no inventé un slider que no existe en el
contenido de abajo) y anoté en el propio contenido de la página una nota
para el cliente explicando esto mismo en una sola línea.

## Estilo (inspiración, no copia) — sin cambios respecto a v1

Como pidió el usuario: tomé de `headstartdaycare.org` solo la idea de
estilo (colores saturados y alegres, titular grande con personalidad,
elemento circular decorativo tipo insignia) — nunca su estructura, su copy
ni su layout exacto. Los tres colores (amarillo, naranja/coral y celeste)
se extrajeron directo de los píxeles reales del logo digitalizado, no son
una elección al azar. Sigue pendiente confirmar con el cliente si esta
paleta es la identidad oficial más allá del logo.

## Estructura de la página (secciones) — v2

1. **Aviso de ejemplo** (actualizado a v2).
2. **Hero** (mejorado): logo real + insignia "¡Bienvenidos!" + **headline de
   marketing** "Más de 20 años ayudando a que tus hijos aprendan jugando" +
   subtítulos de marketing con los datos reales (edades, ubicación, horario)
   + botón **CTA de WhatsApp** ("Escríbenos por WhatsApp") + botón
   secundario "Ver el patio de juegos".
3. **Nueva sección — Por qué elegirnos**: 4 bullets con los hechos
   confirmados (trayectoria, edades, horario, metodología), tal como los
   definió `agente-marketing`, ningún bullet nuevo agregado por mí.
4. **Nueva sección — Así aprenden jugando**: 3 fotos reales (patio y salón)
   con una micro-frase corta cada una conectando la foto con un aprendizaje
   concreto, siguiendo la idea de diseño del brief de marketing.
5. **Nuestro patio de juegos**: galería nativa (`core/gallery`, grilla
   estática — ver nota de arriba sobre el pedido de carrusel) con las 6
   fotos reales del patio.
6. **Nuestro salón y nuestro día**: sin cambios respecto a v1 (fotos del
   salón + horario real de la pizarra).
7. **Bienvenida "Back to School"**: sin cambios respecto a v1.
8. **Contacto e inscripciones** (actualizado): dirección, horario de
   atención al público y edades **ya completos con los datos reales** (ya
   no son `[Completar: ...]`). Solo quedan pendientes teléfono/WhatsApp y
   tarifas/proceso de inscripción — genuinamente no confirmados todavía. El
   botón de WhatsApp usa el texto sugerido por marketing y un `href="#"`
   con nota visible de que falta el número real.

## Contenido listo para `contenidoHtml`

```html
<!-- wp:paragraph {"style":{"color":{"background":"#FDEBD0","text":"#7A4B00"},"spacing":{"padding":{"top":"12px","right":"16px","bottom":"12px","left":"16px"}},"border":{"radius":"12px"}},"fontSize":"small"} -->
<p class="has-background has-text-color has-small-font-size" style="border-radius:12px;background-color:#FDEBD0;color:#7A4B00;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px">Ejemplo de estructura de página (v2) para Estrellitas Day Care — armado con bloques nativos de WordPress, editable haciendo clic directo en el editor. Solo quedan pendientes <strong>teléfono/WhatsApp</strong> y <strong>tarifas/proceso de inscripción</strong> — marcados como <strong>[Completar: ...]</strong> más abajo, sin inventar.</p>
<!-- /wp:paragraph -->

<!-- wp:group {"align":"full","style":{"color":{"background":"#F0CC3C"},"spacing":{"padding":{"top":"56px","right":"24px","bottom":"56px","left":"24px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background" style="background-color:#F0CC3C;padding-top:56px;padding-right:24px;padding-bottom:56px;padding-left:24px">

<!-- wp:image {"align":"center","width":130,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image aligncenter size-large is-resized"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/estrellitas-logo.png" alt="Logo de Estrellitas Day Care" width="130"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"color":{"background":"#E46C30"},"border":{"radius":"999px"},"spacing":{"padding":{"top":"14px","right":"22px","bottom":"14px","left":"22px"}},"dimensions":{"minHeight":"0px"}},"layout":{"type":"flex","orientation":"horizontal","justifyContent":"center"}} -->
<div class="wp-block-group has-background" style="border-radius:999px;background-color:#E46C30;padding-top:14px;padding-right:22px;padding-bottom:14px;padding-left:22px">
<!-- wp:paragraph {"align":"center","style":{"color":{"text":"#FFFFFF"},"typography":{"fontWeight":"700"}},"fontSize":"small"} -->
<p class="has-text-align-center has-text-color has-small-font-size" style="color:#FFFFFF;font-weight:700">✨ ¡Bienvenidos!</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"42px","fontWeight":"800","lineHeight":"1.15"}},"color":{"text":"#2B2B2B"}} -->
<h1 class="wp-block-heading has-text-align-center has-text-color" style="color:#2B2B2B;font-size:42px;font-weight:800;line-height:1.15">Más de 20 años ayudando a que tus hijos aprendan jugando</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"19px"},"color":{"text":"#2B2B2B"}}} -->
<p class="has-text-align-center has-text-color" style="color:#2B2B2B;font-size:19px">Cuidado infantil de 2 meses a 10 años, en South Ozone Park, NY.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"19px"},"color":{"text":"#2B2B2B"}}} -->
<p class="has-text-align-center has-text-color" style="color:#2B2B2B;font-size:19px">Un lugar seguro donde jugar es la forma de aprender — todos los días, de 7am a 6pm.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
<!-- wp:button {"style":{"color":{"background":"#25D366","text":"#FFFFFF"},"border":{"radius":"999px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button has-text-color has-background" href="#contacto" style="border-radius:999px;color:#FFFFFF;background-color:#25D366">📲 Escríbenos por WhatsApp</a></div>
<!-- /wp:button -->
<!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"999px"}}} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#patio" style="border-radius:999px">Ver el patio de juegos</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->

</div>
<!-- /wp:group -->

<!-- wp:group {"anchor":"por-que-elegirnos","style":{"spacing":{"padding":{"top":"48px","right":"24px","bottom":"48px","left":"24px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" id="por-que-elegirnos" style="padding-top:48px;padding-right:24px;padding-bottom:48px;padding-left:24px">

<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">¿Por qué elegirnos?</h2>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns">

<!-- wp:column {"style":{"color":{"background":"#FFF6DC"},"spacing":{"padding":{"top":"20px","right":"16px","bottom":"20px","left":"16px"}},"border":{"radius":"14px"}}} -->
<div class="wp-block-column has-background" style="border-radius:14px;background-color:#FFF6DC;padding-top:20px;padding-right:16px;padding-bottom:20px;padding-left:16px">
<!-- wp:paragraph {"align":"center","fontSize":"large"} -->
<p class="has-text-align-center has-large-font-size">⭐</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center"><strong>+20 años</strong> de trayectoria cuidando y educando a familias de South Ozone Park.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->

<!-- wp:column {"style":{"color":{"background":"#FFF6DC"},"spacing":{"padding":{"top":"20px","right":"16px","bottom":"20px","left":"16px"}},"border":{"radius":"14px"}}} -->
<div class="wp-block-column has-background" style="border-radius:14px;background-color:#FFF6DC;padding-top:20px;padding-right:16px;padding-bottom:20px;padding-left:16px">
<!-- wp:paragraph {"align":"center","fontSize":"large"} -->
<p class="has-text-align-center has-large-font-size">👶</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Atendemos <strong>desde los 2 meses hasta los 10 años</strong>.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->

<!-- wp:column {"style":{"color":{"background":"#FFF6DC"},"spacing":{"padding":{"top":"20px","right":"16px","bottom":"20px","left":"16px"}},"border":{"radius":"14px"}}} -->
<div class="wp-block-column has-background" style="border-radius:14px;background-color:#FFF6DC;padding-top:20px;padding-right:16px;padding-bottom:20px;padding-left:16px">
<!-- wp:paragraph {"align":"center","fontSize":"large"} -->
<p class="has-text-align-center has-large-font-size">🕖</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Horario de <strong>7am a 6pm</strong>, todos los días hábiles.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->

<!-- wp:column {"style":{"color":{"background":"#FFF6DC"},"spacing":{"padding":{"top":"20px","right":"16px","bottom":"20px","left":"16px"}},"border":{"radius":"14px"}}} -->
<div class="wp-block-column has-background" style="border-radius:14px;background-color:#FFF6DC;padding-top:20px;padding-right:16px;padding-bottom:20px;padding-left:16px">
<!-- wp:paragraph {"align":"center","fontSize":"large"} -->
<p class="has-text-align-center has-large-font-size">🧩</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Metodología lúdica: <strong>los niños aprenden jugando</strong>, no memorizando.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->

<!-- wp:group {"anchor":"asi-aprenden-jugando","style":{"color":{"background":"#FFF9EC"},"spacing":{"padding":{"top":"56px","right":"24px","bottom":"56px","left":"24px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" id="asi-aprenden-jugando" style="background-color:#FFF9EC;padding-top:56px;padding-right:24px;padding-bottom:56px;padding-left:24px">

<!-- wp:heading {"textAlign":"center","style":{"color":{"text":"#E46C30"}}} -->
<h2 class="wp-block-heading has-text-align-center has-text-color" style="color:#E46C30">Así aprenden jugando</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Nuestra metodología no es solo una frase: se ve todos los días en el patio y en el salón.</p>
<!-- /wp:paragraph -->

<!-- wp:columns -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"16px"}}} -->
<figure class="wp-block-image size-large has-custom-border"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/patio-05-autos-de-juguete.jpg" alt="Niños compartiendo los carritos de juguete en el patio" style="border-radius:16px"/><figcaption class="wp-element-caption"><strong>Aquí aprenden a compartir turnos.</strong></figcaption></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"16px"}}} -->
<figure class="wp-block-image size-large has-custom-border"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/salon-01-pizarra-horario.jpg" alt="Pizarra con el horario del salón" style="border-radius:16px"/><figcaption class="wp-element-caption"><strong>Aquí aprenden rutina y organización.</strong></figcaption></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"16px"}}} -->
<figure class="wp-block-image size-large has-custom-border"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/salon-02-actividad-grupal.png" alt="Cuidadora con niños en actividad grupal en el salón" style="border-radius:16px"/><figcaption class="wp-element-caption"><strong>Aquí aprenden trabajando en equipo.</strong></figcaption></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->

<!-- wp:group {"anchor":"patio","style":{"spacing":{"padding":{"top":"56px","right":"24px","bottom":"56px","left":"24px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" id="patio" style="padding-top:56px;padding-right:24px;padding-bottom:56px;padding-left:24px">

<!-- wp:heading {"textAlign":"center","style":{"color":{"text":"#E46C30"}}} -->
<h2 class="wp-block-heading has-text-align-center has-text-color" style="color:#E46C30">Nuestro patio de juegos</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Fotos reales del patio de Estrellitas: casita, tobogán, columpios, carritos y área de picnic.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontStyle":"italic"}},"fontSize":"small"} -->
<p class="has-text-align-center has-small-font-size" style="font-style:italic">Nota para el cliente: por ahora esta es una galería fija (todas las fotos se ven a la vez). Convertirla en un carrusel rotativo requiere un plugin de slider — ver la sección "Novedad: fotos que van cambiando" del documento fuente de esta página.</p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"columns":3,"linkTo":"none","sizeSlug":"large"} -->
<figure class="wp-block-gallery has-nested-images columns-3 is-cropped">

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/patio-01-juegos-general.jpg" alt="Vista general del patio de juegos"/><figcaption class="wp-element-caption">Vista general del patio</figcaption></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/patio-02-casita-tobogan.jpg" alt="Casita y tobogán del patio"/><figcaption class="wp-element-caption">Casita y tobogán</figcaption></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/patio-03-columpio.jpg" alt="Columpio del patio"/><figcaption class="wp-element-caption">Columpio</figcaption></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/patio-04-toboganes-picnic.jpg" alt="Toboganes y área de picnic"/><figcaption class="wp-element-caption">Toboganes y área de picnic</figcaption></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/patio-05-autos-de-juguete.jpg" alt="Carritos de juguete en el patio"/><figcaption class="wp-element-caption">Carritos de juguete</figcaption></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/patio-06-columpio-cerca.jpg" alt="Columpio de cerca"/><figcaption class="wp-element-caption">Columpio, de cerca</figcaption></figure>
<!-- /wp:image -->

</figure>
<!-- /wp:gallery -->

</div>
<!-- /wp:group -->

<!-- wp:group {"anchor":"salon","style":{"color":{"background":"#FFF6DC"},"spacing":{"padding":{"top":"56px","right":"24px","bottom":"56px","left":"24px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" id="salon" style="background-color:#FFF6DC;padding-top:56px;padding-right:24px;padding-bottom:56px;padding-left:24px">

<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Nuestro salón y nuestro día</h2>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/salon-02-actividad-grupal.png" alt="Cuidadora con niños en actividad grupal"/><figcaption class="wp-element-caption">Actividad grupal en el salón</figcaption></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/salon-01-pizarra-horario.jpg" alt="Pizarra con el horario real del salón"/><figcaption class="wp-element-caption">Pizarra &#8220;Today's Schedule&#8221; del salón</figcaption></figure>
<!-- /wp:image -->

</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Horario real (tomado de la pizarra del salón)</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list">
<!-- wp:list-item -->
<li><strong>Integración</strong> — bienvenida del día</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>8:30–9:30</strong> — AM Snack (merienda de la mañana)</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>9:30–10:30</strong> — Circle Time</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Nap Time</strong> — siesta</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Clean Up &amp; Handwashing</strong> — orden y lavado de manos</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>3:00–4:00</strong> — Gym (actividad física)</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>4:00–4:30</strong> — Dinner (cena)</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Diaper Changing</strong> — cambio de pañal</li>
<!-- /wp:list-item -->
</ul>
<!-- /wp:list -->

<!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="font-style:italic">Nota: la pizarra tiene un par de bloques adicionales que todavía no se pudieron leer con certeza en la foto — se completan apenas se confirmen.</p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->

<!-- wp:group {"anchor":"evento","style":{"spacing":{"padding":{"top":"56px","right":"24px","bottom":"56px","left":"24px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" id="evento" style="padding-top:56px;padding-right:24px;padding-bottom:56px;padding-left:24px">

<!-- wp:heading {"textAlign":"center","style":{"color":{"text":"#6CB4E4"}}} -->
<h2 class="wp-block-heading has-text-align-center has-text-color" style="color:#6CB4E4">Bienvenida &#8220;Back to School&#8221;</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Así celebramos el regreso a clases en Estrellitas.</p>
<!-- /wp:paragraph -->

<!-- wp:columns -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/evento-01-back-to-school-bebe.png" alt="Bienvenida Back to School - bebé"/><figcaption class="wp-element-caption">Bienvenida Back to School</figcaption></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://TU-DOMINIO.com/wp-content/uploads/2026/09/evento-02-back-to-school-nino.png" alt="Bienvenida Back to School - niño"/><figcaption class="wp-element-caption">Bienvenida Back to School</figcaption></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->

<!-- wp:group {"anchor":"contacto","align":"full","style":{"color":{"background":"#6CB4E4"},"spacing":{"padding":{"top":"56px","right":"24px","bottom":"56px","left":"24px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background" id="contacto" style="background-color:#6CB4E4;padding-top:56px;padding-right:24px;padding-bottom:56px;padding-left:24px">

<!-- wp:heading {"textAlign":"center","style":{"color":{"text":"#FFFFFF"}}} -->
<h2 class="wp-block-heading has-text-align-center has-text-color" style="color:#FFFFFF">Contacto e inscripciones</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"color":{"text":"#FFFFFF"}}} -->
<p class="has-text-align-center has-text-color" style="color:#FFFFFF">Visítanos o escríbenos. Solo faltan confirmar el teléfono/WhatsApp y las tarifas — el resto ya son datos reales.</p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"color":{"background":"#FFFFFF"},"spacing":{"padding":{"top":"24px","right":"24px","bottom":"24px","left":"24px"}},"border":{"radius":"16px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" style="border-radius:16px;background-color:#FFFFFF;padding-top:24px;padding-right:24px;padding-bottom:24px;padding-left:24px">

<!-- wp:list -->
<ul class="wp-block-list">
<!-- wp:list-item -->
<li><strong>Dirección:</strong> 132-31 114th Street, South Ozone Park, NY, 11420.</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Teléfono / WhatsApp:</strong> [Completar: número real de contacto]</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Horario de atención al público:</strong> 7:00 am a 6:00 pm.</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Tarifas y proceso de inscripción:</strong> [Completar: tarifas reales y pasos para inscribirse]</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Edades que se atienden:</strong> desde los 2 meses hasta los 10 años.</li>
<!-- /wp:list-item -->
</ul>
<!-- /wp:list -->

</div>
<!-- /wp:group -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
<!-- wp:button {"style":{"color":{"background":"#25D366","text":"#FFFFFF"},"border":{"radius":"999px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button has-text-color has-background" href="#" style="border-radius:999px;color:#FFFFFF;background-color:#25D366">📲 Escríbenos por WhatsApp</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->

<!-- wp:paragraph {"align":"center","style":{"color":{"text":"#FFFFFF"},"typography":{"fontStyle":"italic"}},"fontSize":"small"} -->
<p class="has-text-align-center has-text-color has-small-font-size" style="color:#FFFFFF;font-style:italic">[Completar: link real de WhatsApp — formato wa.me/NUMERO — reemplazar el href="#" del botón de arriba en cuanto el cliente confirme el número]</p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
```

## Antes de importar esto de verdad — pasos manuales necesarios

1. **Subir las fotos y el logo a la Biblioteca de Medios de WordPress**
   (wp-admin → Medios → Añadir nuevo) con estos mismos 9 archivos reales:
   `estrellitas-logo.png`, `patio-01-juegos-general.jpg` … `patio-06-columpio-cerca.jpg`,
   `salon-01-pizarra-horario.jpg`, `salon-02-actividad-grupal.png`,
   `evento-01-back-to-school-bebe.png`, `evento-02-back-to-school-nino.png`.
2. Los `src="https://TU-DOMINIO.com/wp-content/uploads/..."` de arriba son
   **placeholders con el nombre de archivo real** — no URLs inventadas.
   Reemplazar en el editor con "Reemplazar" → elegir el archivo ya subido.
3. **Reemplazar el `href="#"` del botón de WhatsApp** (aparece dos veces: en
   el Hero y en Contacto) por el link real `https://wa.me/NUMERO` en cuanto
   el cliente confirme el teléfono. Hasta entonces, el botón queda visible
   pero sin destino funcional — se avisa con la nota en itálica debajo del
   botón de Contacto.
4. Completar los 2 `[Completar: ...]` que quedan (teléfono/WhatsApp,
   tarifas) cuando el cliente los confirme.
5. Definir e instalar la opción de slider elegida (Jetpack, Smart Slider 3
   o MetaSlider) una vez que se confirme el dominio/hosting y qué plugins
   admite ese plan — ver la sección de arriba sobre el pedido de carrusel.
6. Confirmar dominio + `WP_ADMIN_USER` / `WP_ADMIN_APP_PASSWORD` en
   `dashboard/.env.local` para poder llamar `crearPaginaWordpress()`.

## Capacidad 2 (JSON para Elementor Pro) — sin cambios respecto a v1

Sigue sin usarse por los mismos dos motivos de la v1: (1) no existe todavía
una pieza que importe ese JSON a un WordPress real, y (2) requeriría
Elementor Pro instalado y licenciado en el sitio de destino, algo que no
está confirmado. El camino real hoy para un diseño a medida sigue siendo
HTML/bloques nativos (Capacidad 1), como en este documento.

## Falta completar (heredado del README, sin resolver acá)

- Teléfono / WhatsApp de contacto — bloquea el link funcional del botón CTA.
- Tarifas y proceso de inscripción.
- Confirmar dominio y hosting reales para conectar a `/api/hostinger/deploy`
  y para saber qué plugin de slider está disponible en ese hosting.
- Confirmar si la paleta extraída del logo (amarillo/naranja/celeste) es la
  identidad oficial de marca más allá del logo mismo.

## Changelog — qué cambió respecto a la v1

- **Headline y subtítulos del Hero** reemplazados por el copy exacto del
  brief de `agente-marketing`: "Más de 20 años ayudando a que tus hijos
  aprendan jugando" + los dos subtítulos con edades/ubicación y
  horario/metodología.
- **Botón CTA de WhatsApp** agregado en el Hero y reforzado en Contacto,
  con el texto sugerido por marketing ("Escríbenos por WhatsApp"), color
  distintivo (verde WhatsApp) y `href="#"` con nota visible de que el link
  real (`wa.me/NUMERO`) sigue pendiente — nunca se inventó un número.
- **Nueva sección "¿Por qué elegirnos?"** con los 4 bullets de hechos
  confirmados del brief de marketing (trayectoria, edades, horario,
  metodología), ningún bullet nuevo agregado por este agente.
- **Nueva sección "Así aprenden jugando"** con 3 fotos reales (carritos del
  patio, pizarra del salón, actividad grupal) y las 3 micro-frases
  sugeridas por marketing, cada una conectada a una foto real coherente.
- **Sección de Contacto actualizada**: dirección, horario de atención al
  público y edades ahora son datos reales (ya no `[Completar: ...]`). Solo
  quedan pendientes teléfono/WhatsApp y tarifas/proceso de inscripción.
- **Nueva sección honesta sobre el pedido de carrusel/slider**: se explica
  que Gutenberg core no trae un bloque de slider nativo, y se documentan
  las 3 opciones reales (plugin de slider — recomendada —, bloque de
  slideshow del tema si lo trae, o código a medida como último recurso), en
  vez de simular que ya existe una solución nativa. La galería del patio
  sigue siendo una grilla estática por ahora, con una nota visible para el
  cliente explicándolo.
- Aviso de ejemplo, changelog y numeración de "Estructura de la página"
  actualizados para reflejar la v2.
