# Web WordPress — ejemplo de página de Inicio (Estrellitas Day Care)

> Generado por el Agente Web WordPress. Cliente activo: `estrellitas-day-care`.
> Fuente de datos: `clientes/estrellitas-day-care/README.md` (único origen de
> verdad) + las fotos reales en `clientes/estrellitas-day-care/assets/fotos/`
> + el logo digitalizado en `clientes/estrellitas-day-care/assets/branding/`.
> No se usó ningún dato, precio, dirección, teléfono ni copy que no esté
> declarado en esas fuentes.

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

Todavía no lo mandé al endpoint porque, según el propio README, faltan datos
de contacto reales y todavía no sabemos si el dominio/hosting del cliente
ya están listos (ver sección "Lo que falta" abajo) — publicar antes de eso
dejaría un sitio real con huecos de cara al público. El endpoint además crea
la página como **borrador (`draft`)** por defecto, nunca publicada
automáticamente, así que aun mandándolo ya, no quedaría visible al público
sin un paso explícito adicional.

## Por qué son bloques nativos de Gutenberg y no un solo bloque de HTML

Usé `core/heading`, `core/paragraph`, `core/image`, `core/gallery`,
`core/columns`/`core/column`, `core/list`/`core/list-item`, `core/buttons`/
`core/button` y `core/group` (para fondos de color y el "gajo" circular
decorativo) — **cero `core/html` de bloque único**. La diferencia práctica:
con bloques nativos, el usuario entra al editor de WordPress y puede hacer
clic directo sobre una foto para reemplazarla, sobre un párrafo para
reescribirlo, o arrastrar una columna, sin tocar código. Un bloque gigante
de HTML crudo se vería en el editor como una sola caja opaca de código —
technically funciona, pero no es editable a golpe de clic, que es
justamente lo que pidió el usuario para poder "agregar fotos e información
fácilmente" él mismo más adelante.

## Estilo (inspiración, no copia)

Como pidió el usuario: tomé de `headstartdaycare.org` solo la idea de
estilo (colores saturados y alegres, titular grande con personalidad,
elemento circular decorativo tipo insignia) — nunca su estructura, su copy
ni su layout exacto. Los tres colores que usé (amarillo, naranja/coral y
celeste) **no los inventé**: los extraje directamente de los píxeles reales
del logo digitalizado (`estrellitas-logo.png`) con una muestra de color
programática, así que son la paleta real de la marca, no una elegida al
azar por mí. El README ya deja anotado que falta confirmar con el cliente
si esta paleta es la identidad oficial más allá del logo — eso sigue
pendiente, no lo resolví yo acá.

Nota de diseño (no incluida en el contenido, porque no es algo que se pueda
forzar de forma nativa/editable sin saber el tema del sitio): si más
adelante se quiere una tipografía tipo marcador/manuscrita para los
títulos (ej. Fredoka, Baloo 2, Patrick Hand), eso se configura una sola vez
en el tema (Apariencia → Editor → Estilos → Tipografía) o instalando esas
Google Fonts en el sitio — no lo metí a la fuerza en el HTML del contenido
para no romper la edición nativa por bloques ni depender de un tema que no
conozco.

## Estructura de la página (secciones)

1. **Aviso de ejemplo** (párrafo destacado arriba de todo, para que se note
   en el editor que esto es un borrador de estructura).
2. **Hero**: logo real + insignia circular "¡Bienvenidos!" + título
   "Estrellitas Day Care" + subtítulo descriptivo (giro real: guardería
   infantil) + botones "Escríbenos" / "Ver el patio de juegos".
3. **Nuestro patio de juegos**: galería nativa (`core/gallery`) con las 6
   fotos reales del patio (`patio-01` a `patio-06`), cada una con su
   descripción real tomada del README.
4. **Nuestro salón y nuestro día**: columnas con las fotos reales del salón
   (`salon-02-actividad-grupal.png`, `salon-01-pizarra-horario.jpg`) y una
   lista (`core/list`) con el **horario real** tal como se transcribió de
   la pizarra "Today's Schedule" (mismo dato real ya usado en
   `web-preview.html` — no se volvió a inventar), incluida la nota honesta
   de que un par de bloques de la pizarra no se pudieron leer con certeza.
5. **Bienvenida "Back to School"**: columnas con las 2 fotos reales del
   evento.
6. **Contacto e inscripciones**: lista con los 5 datos que el README marca
   como pendientes, cada uno como su propio párrafo/ítem editable con el
   texto `[Completar: ...]` bien visible (dirección, teléfono/WhatsApp,
   horario de atención al público, tarifas y proceso de inscripción,
   edades atendidas) — nunca se inventó ningún valor. El botón de WhatsApp
   también queda marcado como `[Completar link real]` en vez de un número
   inventado.

## Contenido listo para `contenidoHtml`

Este bloque completo es el valor que iría en `CrearPaginaParams.contenidoHtml`
(y `titulo: "Inicio"`, `dominio` del cliente, `estado: "draft"` para no
publicar de una) al llamar `crearPaginaWordpress()` / `/api/hostinger/deploy`.

```html
<!-- wp:paragraph {"style":{"color":{"background":"#FDEBD0","text":"#7A4B00"},"spacing":{"padding":{"top":"12px","right":"16px","bottom":"12px","left":"16px"}},"border":{"radius":"12px"}},"fontSize":"small"} -->
<p class="has-background has-text-color has-small-font-size" style="border-radius:12px;background-color:#FDEBD0;color:#7A4B00;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px">Ejemplo de estructura de página para Estrellitas Day Care — armado con bloques nativos de WordPress para que se pueda completar (fotos, textos, datos de contacto) haciendo clic directo en el editor, sin tocar código. Faltan datos reales marcados como <strong>[Completar: ...]</strong> más abajo — no se inventaron.</p>
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

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"46px","fontWeight":"800"},"color":{"text":"#2B2B2B"}}} -->
<h1 class="wp-block-heading has-text-align-center has-text-color" style="color:#2B2B2B;font-size:46px;font-weight:800">Estrellitas Day Care</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"20px"},"color":{"text":"#2B2B2B"}}} -->
<p class="has-text-align-center has-text-color" style="color:#2B2B2B;font-size:20px">Guardería infantil. Así es un día en Estrellitas: patio de juegos, rutina diaria y momentos en familia.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
<!-- wp:button {"style":{"color":{"background":"#E46C30","text":"#FFFFFF"},"border":{"radius":"999px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button has-text-color has-background" href="#contacto" style="border-radius:999px;color:#FFFFFF;background-color:#E46C30">Escríbenos</a></div>
<!-- /wp:button -->
<!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"999px"}}} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#patio" style="border-radius:999px">Ver el patio de juegos</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->

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
<p class="has-text-align-center has-text-color" style="color:#FFFFFF">Esta es una página de ejemplo. Estos son los datos reales que todavía faltan para poder publicar el sitio de verdad — nunca se inventan, se completan cuando el negocio los confirme.</p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"color":{"background":"#FFFFFF"},"spacing":{"padding":{"top":"24px","right":"24px","bottom":"24px","left":"24px"}},"border":{"radius":"16px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" style="border-radius:16px;background-color:#FFFFFF;padding-top:24px;padding-right:24px;padding-bottom:24px;padding-left:24px">

<!-- wp:list -->
<ul class="wp-block-list">
<!-- wp:list-item -->
<li><strong>Dirección:</strong> [Completar: dirección real del local]</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Teléfono / WhatsApp:</strong> [Completar: número real de contacto]</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Horario de atención al público:</strong> [Completar: horario real, distinto del horario diario de actividades de arriba]</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Tarifas y proceso de inscripción:</strong> [Completar: tarifas reales y pasos para inscribirse]</li>
<!-- /wp:list-item -->
<!-- wp:list-item -->
<li><strong>Edades que se atienden:</strong> [Completar: rango de edades real]</li>
<!-- /wp:list-item -->
</ul>
<!-- /wp:list -->

</div>
<!-- /wp:group -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
<!-- wp:button {"style":{"color":{"background":"#E46C30","text":"#FFFFFF"},"border":{"radius":"999px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button has-text-color has-background" href="#" style="border-radius:999px;color:#FFFFFF;background-color:#E46C30">Escríbenos por WhatsApp [Completar link real]</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->

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
   **placeholders con el nombre de archivo real** — no URLs inventadas de la
   nada. Una vez subidas las fotos, cada bloque de imagen se puede abrir en
   el editor y usar "Reemplazar" → elegir el archivo ya subido (así WordPress
   asigna el ID de medio correcto), en vez de editar la URL a mano.
3. Completar los 5 `[Completar: ...]` de la sección de Contacto con los
   datos reales cuando el cliente los confirme.
4. Confirmar dominio + `WP_ADMIN_USER` / `WP_ADMIN_APP_PASSWORD` en
   `dashboard/.env.local` para poder llamar `crearPaginaWordpress()`.

## Capacidad 2 (JSON para Elementor Pro) — qué hace y por qué no la usé acá

Mi Capacidad 2 es generar un **JSON importable para Elementor Pro**: la
especificación de diseño de una página con secciones más elaboradas que un
tema estándar de Gutenberg puede lograr con dificultad — un Hero con la
propuesta de valor ya maquetada a nivel pixel, una comparativa visual vs la
competencia real del cliente, tarjetas de kits/paquetes con precios reales,
una tabla de cumplimiento normativo (cuando el rubro del cliente lo exige),
y un CTA de contacto con más control visual fino (superposiciones,
animaciones de entrada, columnas asimétricas) del que da Gutenberg nativo.

**No la usé en esta tarea por dos motivos concretos, no por preferencia:**

1. **No hay pieza que la importe todavía.** El JSON de Elementor es hoy solo
   una especificación de diseño — no existe (todavía no se construyó) un
   endpoint o script que tome ese JSON y lo empuje a un WordPress real, a
   diferencia de la Capacidad 1, que sí tiene ese camino completo hoy
   (`crearPaginaWordpress()` → `/wp-json/wp/v2/pages`).
2. **Requiere Elementor Pro instalado y licenciado en ese sitio específico.**
   No sé (y no me corresponde asumir) si el WordPress de Estrellitas va a
   tener Elementor Pro — eso depende de qué plan de hosting/plugins se
   contrate. Sin esa licencia activa en el sitio de destino, ese JSON no se
   podría ni importar aunque existiera la pieza de conexión.

Por eso, para lograr un diseño más elaborado y a medida *hoy mismo*, el
camino real es seguir escribiendo HTML/bloques nativos a medida (Capacidad
1, como en este documento) en vez de depender de una pieza que todavía no
existe. Si en algún momento se decide invertir en Elementor Pro + construir
esa pieza de importación, la Capacidad 2 pasaría a ser la opción para un
rediseño más ambicioso de este mismo contenido.

## Falta completar (heredado del README, sin resolver acá)

- Dirección del local.
- Teléfono / WhatsApp de contacto.
- Horario de atención al público.
- Tarifas y proceso de inscripción.
- Edades que se atienden.
- Confirmar dominio y hosting reales para conectar a `/api/hostinger/deploy`.
- Confirmar si la paleta extraída del logo (amarillo/naranja/celeste) es la
  identidad oficial de marca más allá del logo mismo.
