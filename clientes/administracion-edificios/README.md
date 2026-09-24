# Administración de Edificios

> Cliente nuevo, armado a partir de lo que Jaime describió directo en el chat del War
> Room (no viene de un diagnóstico ya corrido ni de un archivo previo). El nombre del
> slug ("administracion-edificios") se eligió como más amplio que "contabilidad
> edificios" porque el trabajo pedido cubre tanto contabilidad como administración —
> si preferís otro nombre, se renombra la carpeta sin problema, es solo texto.

## Datos del negocio (declarados por el usuario, sin verificar todavía)

- **Giro:** Administración y contabilidad de propiedades en alquiler (casas
  subdivididas en departamentos).
- **Escala aproximada:** ~50 cuentas bancarias, cada una ligada a 4-5 casas, cada
  casa con 4-5 inquilinos/departamentos → ~400 unidades en total.
- **Operación que hay que manejar:** ingresos y egresos por propiedad, balances
  (saber si cada casa/cuenta gana o pierde), y pago de créditos de las casas (los
  créditos se pagan desde las mismas cuentas bancarias de cada casa).
- **Dolor declarado:** el proceso hoy lo hace una contadora de forma manual: el
  objetivo es automatizarlo para reducirle horas de trabajo.
- **Dirección de software elegida:** Buildium (Open API de autoservicio, plan
  Premium) — se evaluó también Yardi, pero su API requiere entrar al programa
  "Interface Partner" de Yardi en vez de una API de autoservicio, así que no se
  eligió por ahora. Ver la respuesta del arquitecto del War Room en el chat
  (22-sep-2026) para el detalle de esa comparación y las fuentes.
- **Alcance de equipo pedido:** NO se quiere activar los 22 agentes del War Room
  para el trabajo recurrente — se pidió un "equipo contable" chico. Se creó
  `agente-contable` (ver `.claude/agents/agente-contable.md`) específicamente para
  esto, generalista y reusable para cualquier cliente con operación contable real
  (no solo este) — distinto de `agente-finanzas`, que evalúa viabilidad de ideas
  nuevas, no operación ya en marcha.

## Falta completar (pedir al usuario, no inventar)

- ¿Ya existe una cuenta de Buildium contratada, o todavía hay que darla de alta?
- Lista real de las cuentas bancarias / casas / inquilinos (los números de arriba
  son una estimación aproximada que dio el usuario, no un conteo real todavía).
- ¿Cómo hace la contadora el proceso hoy (Excel, otro software, papel)? — para
  saber qué hay que migrar.
- Términos reales de los créditos por casa (tasa, plazo, cuotas) — sin esto
  `agente-contable` no puede seguir el cronograma de pagos de verdad.
- ¿Quién es el dueño/estructura legal detrás de las 50 cuentas? (una sola empresa
  administradora, o cada casa es de un dueño distinto).
- Presupuesto/urgencia para contratar el plan Premium de Buildium.

## Próximo paso técnico (cuando haya API key real de Buildium)

Construir `lib/buildium-client.ts` (mismo patrón que `lib/hostinger-client.ts`) para
traer libro mayor, transacciones bancarias y saldos por unidad, y que
`agente-contable` trabaje sobre esos datos reales en vez de un README estático —
no se arma todavía porque no hay cuenta ni datos reales para probarlo contra nada.
