---
producto: Validación de Negocio por WhatsApp
tipo: Flujo técnico (n8n)
estado: Diseño — no implementado todavía
---

# Flujo: WhatsApp Business API → n8n → War Room (Claude API) → WhatsApp

Diagrama de cómo se conecta el chat de WhatsApp con el War Room. Esto es un DISEÑO, no una integración
ya construida — no hay número de WhatsApp Business ni instancia de n8n conectados todavía. Se marca
así de forma explícita para no hacer creer que el flujo ya está corriendo (Modo Brutal: no se inventa
que algo funciona si no se ha probado).

## Diagrama (texto)

```
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────────┐      ┌──────────────────┐
│  Cliente escribe │ ───► │  WhatsApp Business │ ───► │  Webhook n8n          │ ───► │  Claude API        │
│  por WhatsApp    │      │  API (Meta)        │      │  (recibe el mensaje,  │      │  (War Room /       │
│                  │      │                    │      │  identifica el número │      │  Agente 00)        │
└─────────────────┘      └──────────────────┘      │  = ¿cliente nuevo o    │      └────────┬─────────┘
                                                     │  ya en conversación?)  │               │
                                                     └───────────────────────┘               │
                                                                                              ▼
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────────┐      ┌──────────────────┐
│  Cliente recibe  │ ◄─── │  WhatsApp Business │ ◄─── │  Webhook n8n          │ ◄─── │  Respuesta del     │
│  la respuesta    │      │  API (Meta)        │      │  (formatea y envía    │      │  Agente 00         │
│  en el chat      │      │                    │      │  la respuesta)        │      │  (máx 3 líneas)    │
└─────────────────┘      └──────────────────┘      └───────────────────────┘      └──────────────────┘
```

## Paso a paso

1. **Entrada — WhatsApp Business API (Meta):** el cliente escribe al número de WhatsApp Business.
   Meta reenvía ese mensaje a la URL de webhook configurada (la de n8n).
2. **Webhook n8n (entrada):** recibe el payload de Meta, extrae el número de teléfono y el texto.
   Consulta si ese número ya tiene una conversación abierta (para saber en qué pregunta de las 7 va) —
   esto requiere guardar estado por número, por ejemplo en una base de datos simple (Airtable, Postgres,
   o incluso un archivo por número si el volumen es bajo al inicio).
3. **Nodo → Claude API:** n8n arma el prompt: system prompt = contenido de
   `.claude/agents/00-consultor-whatsapp.md`, más el historial de la conversación (para saber en qué
   pregunta de las 7 está), más el mensaje nuevo del cliente. Llama a la Claude API con ese contexto.
4. **Claude API responde:** el Agente 00 devuelve el siguiente mensaje (máximo 3 líneas, la siguiente
   pregunta o el cierre si ya se completaron las 7).
5. **Webhook n8n (salida):** toma la respuesta de Claude y la envía de vuelta a través de la WhatsApp
   Business API al número del cliente.
6. **Cierre del flujo:** cuando se completan las 7 preguntas, n8n también dispara la escritura de
   `clientes/[nombre-negocio]/diagnostico.md` en el repo del War Room (vía la misma llamada a Claude
   API, que ya tiene acceso a herramientas de archivo, o vía un paso adicional de n8n que llama a la
   API de GitHub/al repo directamente).

## Lo que falta para que esto exista de verdad (pendiente, no inventado)

- Número de WhatsApp Business verificado por Meta (requiere cuenta de Meta Business Suite).
- Token de acceso de WhatsApp Business API (Meta) — mismo tipo de restricción ya documentada en
  `agentes/herramientas-por-conectar.md`: Jaime debe crear la cuenta/página y dar el token; el War Room
  no puede crearla por su cuenta por restricción de Meta.
- Instancia de n8n corriendo (self-hosted o n8n cloud) con el webhook expuesto públicamente (HTTPS).
- Una forma de guardar estado de conversación por número (en qué pregunta de las 7 va cada persona) —
  no está resuelto todavía cuál será: Airtable, Postgres, o un store más simple. Se decide cuando se
  implemente, no antes.
- Conexión entre n8n y el repo del War Room para escribir `diagnostico.md` automáticamente — hoy esa
  escritura la hace el Agente 00 manualmente dentro de una sesión de Claude Code, no vía API headless.

## Relación con `clientes/gecko-acabados-hospitalarios/kit-redes/`

Ese kit sigue intacto y no se toca con este flujo — son cosas separadas: el kit de redes es contenido
para publicar (posts, bio, artículos), este flujo es un canal de conversación (WhatsApp) para captar y
diagnosticar clientes nuevos. Ambos pueden coexistir sin cruzarse.
