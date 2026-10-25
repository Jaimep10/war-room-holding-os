import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import pc from 'picocolors';
import { z } from 'zod';
import { config, useWhatsApp } from './config.js';
import { listCallLogs, storeMode } from './db/store.js';
import { analyzeCall } from './orchestrator/blinda.orchestrator.js';

// Perfil por defecto para pruebas cuando el body no trae userProfile.
const DEFAULT_PROFILE = { name: 'Mami', age: 68, isVulnerable: true };

const AnalyzeCallBody = z.object({
  phoneNumber: z.string(),
  transcript: z.string().optional(),
  audioStream: z.string().optional(),
  userProfile: z
    .object({
      name: z.string().min(1),
      age: z.number().int().min(0).max(120),
      isVulnerable: z.boolean(),
      guardianPhone: z.string().optional(),
    })
    .default(DEFAULT_PROFILE),
  callContext: z
    .object({
      hour: z.number().int().min(0).max(23).optional(),
      attemptsToday: z.number().int().min(1).optional(),
    })
    .optional(),
});

const app = Fastify({ logger: false });
await app.register(formbody);

app.get('/health', async () => ({ ok: true, store: storeMode, whatsapp: useWhatsApp ? 'real' : 'mock' }));

app.post('/api/v1/blinda/analyze-call', async (req, reply) => {
  const parsed = AnalyzeCallBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ error: 'Body inválido', issues: parsed.error.issues });
  return analyzeCall(parsed.data);
});

app.get('/api/v1/blinda/call-logs', async () => listCallLogs());

// Webhook de voz de Twilio (configurar en el número de prueba como "A call comes in").
// Twilio manda From como form-urlencoded; respondemos TwiML: rechazar, advertir o dejar pasar.
// TODO antes de exponerlo públicamente: validar la firma X-Twilio-Signature.
app.post('/api/v1/twilio/voice', async (req, reply) => {
  const body = (req.body ?? {}) as Record<string, string>;
  const result = await analyzeCall({ phoneNumber: body.From ?? '', userProfile: DEFAULT_PROFILE });
  const say = (text: string) => `<Say language="es-MX">${text.replace(/[<&>]/g, '')}</Say>`;
  const twiml =
    result.decision === 'BLOQUEAR'
      ? '<Reject reason="rejected"/>'
      : result.decision === 'ADVERTIR'
        ? `${say('Atención, BLINDA detectó que esta llamada puede ser sospechosa. No entregue claves ni haga depósitos.')}<Pause length="1"/>`
        : '';
  reply.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response>${twiml}</Response>`);
});

await app.listen({ port: config.port, host: '0.0.0.0' });
console.log(pc.bold(pc.magenta('\n  BLINDA Fase 1 — Escudo de Llamadas')));
console.log(`  http://localhost:${config.port}  |  datos: ${pc.cyan(storeMode)}  |  WhatsApp: ${pc.cyan(useWhatsApp ? 'real' : 'mock')}\n`);
