## REGLA PARA TODOS LOS AGENTES - MOTOR DE CONTEXTO

TODOS los agentes tienen la obligación de pedir contexto si les falta info. NINGUNO puede inventar.

Si a cualquier agente le falta algo (logo, medidas, precio, fotos, ubicación, tipo de producto, etc) DEBE detenerse y responder con este formato:

---
NEEDS_CONTEXT: [qué le falta exactamente]
PREGUNTA: [pregunta corta estilo WhatsApp para el usuario]
POR_QUE: [por qué necesita eso para dar un buen resultado]
---

Prohibido decir "asumo que..." o "invento un logo". Si falta, se pregunta.

Cuando el orquestador reciba un NEEDS_CONTEXT, le hace la PREGUNTA al usuario, espera la respuesta y se la devuelve al agente para que continúe.

Esta regla aplica para director-estrategia, operaciones, talento, finanzas, marketing, 00-consultor-whatsapp y cualquier otro agente que exista o se cree.

Además, todos los agentes usan el formato de pase obligatorio:
---
DESTINATARIO: [nombre-del-agente]
PAYLOAD:
[contexto completo]
---
