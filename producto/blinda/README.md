# BLINDA — Fase 1: Escudo de Llamadas para Vulnerables

Backend multi-agente (Fastify + TypeScript + LangGraph JS) que decide **BLOQUEAR / ADVERTIR / PERMITIR** una llamada entrante dirigida a un adulto mayor.

## Correr

```bash
npm install
npm run dev          # servidor en http://localhost:3000 (logs de agentes en colores)
npm run demo         # en otra terminal: 7 llamadas simuladas
```

Funciona **sin configurar nada**: sin credenciales de Supabase usa memoria con los mismos 20 números de prueba, y la alerta de WhatsApp se imprime en consola. Para conectar los servicios reales, copia `.env.example` a `.env`.

## Probar con curl

```bash
curl -s -X POST localhost:3000/api/v1/blinda/analyze-call -H 'Content-Type: application/json' -d '{"phoneNumber":"+593991234567","transcript":"Hola le llamamos del IESS, su pensión está suspendida"}'
```

Campos opcionales del body: `audioStream` (Whisper mock: `premio`, `detenido`, `banco`, `venta`), `userProfile` `{ name, age, isVulnerable, guardianPhone }` (por defecto Mami, 68 años) y `callContext` `{ hour, attemptsToday }`.

Otros endpoints: `GET /health`, `GET /api/v1/blinda/call-logs`, `POST /api/v1/twilio/voice` (webhook de voz de Twilio, responde TwiML).

## Flujo (LangGraph)

```
START → call_scout → ┬→ scam_hunter    ─┬→ decide → END
                     └→ vuln_protector ─┘
```

| Agente | Pregunta | Tool |
|---|---|---|
| CallScout | ¿Quién llama? | `phoneReputation` — lista negra (Supabase) + Truecaller mock + privado/spoofeado |
| ScamHunter | ¿Qué dicen? | `audioTranscript` (Whisper mock) + patrones de estafa |
| VulnProtector | ¿Es blanco fácil para ESTA llamada? | `vulnerabilityScore` — >60 años + miedo/venta agresiva = +40; nocturna con >3 intentos = acoso +15 |
| Orquestador | Junta y decide | riesgo ≥70 BLOQUEAR, ≥40 ADVERTIR, si no PERMITIR |

## Supabase

Pega `supabase/schema.sql` en el SQL Editor: crea `blacklisted_numbers` y `call_logs` e inserta 20 números de prueba (ficticios, generados desde `src/db/seed.ts`). La columna del riesgo es `risk_score` (snake_case de Postgres).

## Pendiente antes de producción

- Whisper y Truecaller son mocks; los números de la lista negra son de prueba.
- El webhook de Twilio no valida la firma `X-Twilio-Signature` todavía.
- WhatsApp fuera de la ventana de 24h exige plantilla aprobada por Meta.
- pgvector queda habilitado en el esquema para las huellas de estafas (Fase 2), sin usar aún.
