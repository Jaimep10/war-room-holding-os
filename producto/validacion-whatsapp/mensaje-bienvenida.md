---
producto: Validación de Negocio por WhatsApp
tipo: Mensaje de bienvenida (primer disparo del flujo)
---

# Mensaje de bienvenida

Texto exacto, tal cual lo dio Jaime — no parafrasear, no "mejorar" el copy sin que él lo pida:

```
¡Hola! Soy tu consultor de rentabilidad. En 5 min te digo por qué tu negocio vende pero no te deja plata. ¿Cómo se llama tu negocio y qué vendes en una frase?
```

## Cuándo se dispara

Es el primer mensaje que envía el Agente 00 (`agentes/00-consultor-whatsapp.md` /
`.claude/agents/00-consultor-whatsapp.md`) apenas alguien escribe por primera vez al número de
WhatsApp Business conectado. No lleva emojis extra ni variantes — es fijo, para poder medir
conversión de forma consistente (mismo mensaje = comparable en el tiempo).

## Qué pasa después

La respuesta de la persona (nombre del negocio + qué vende) es lo que el Agente 00 usa para:
1. Crear el slug de carpeta `clientes/[nombre-negocio]/`.
2. Empezar la Pregunta 1 de las 7 preguntas de rentabilidad (ver `.claude/agents/00-consultor-whatsapp.md`).

No se cambia este mensaje sin que Jaime lo pida explícitamente — es el punto de entrada de todo el
producto y cualquier variación rompe la comparabilidad de las métricas de conversión.
