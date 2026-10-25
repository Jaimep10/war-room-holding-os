import { audioTranscriptTool } from '../tools/audioTranscript.tool.js';
import { detectPatterns, TACTIC_WEIGHTS } from '../tools/scamPatterns.js';
import type { CallInput, ScamHunterReport } from '../types.js';
import { log } from '../utils/logger.js';

/** ScamHunter — el Cazador de Estafas: ¿qué dicen? */
export async function scamHunterAgent(input: CallInput): Promise<ScamHunterReport> {
  log('ScamHunter', 'Escuchando la llamada...');
  const { text, source } = await audioTranscriptTool(input);

  if (!text) {
    log('ScamHunter', 'Sin audio ni transcripción: no hay contenido que analizar');
    return { transcript: '', scamPattern: null, manipulationTactics: [], matchedPhrases: [], riskScore: 0 };
  }
  if (source === 'whisper-mock') log('ScamHunter', `Whisper (mock) transcribió: "${text}"`);

  const { patterns, tactics, matchedPhrases } = detectPatterns(text);
  const onlySales = patterns.length > 0 && patterns.every((p) => p.pattern === 'VENTA_AGRESIVA');
  let riskScore = tactics.reduce((sum, t) => sum + TACTIC_WEIGHTS[t], 0) + patterns.length * 10;
  riskScore = Math.min(onlySales ? 40 : 100, riskScore);

  const scamPattern = patterns.length ? patterns.map((p) => p.label).join(' + ') : null;
  log(
    'ScamHunter',
    scamPattern
      ? `Detectado patrón: ${scamPattern} | tácticas: ${tactics.join(', ') || 'ninguna'}`
      : 'No se detectaron patrones de estafa en lo que dicen',
  );

  return { transcript: text, scamPattern, manipulationTactics: tactics, matchedPhrases, riskScore };
}
