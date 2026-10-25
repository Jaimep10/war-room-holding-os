import { config } from '../config.js';
import { audioTranscriptTool } from '../tools/audioTranscript.tool.js';
import { detectPatterns } from '../tools/scamPatterns.js';
import { vulnerabilityScoreTool } from '../tools/vulnerabilityScore.tool.js';
import type { CallInput, CallScoutReport, VulnProtectorReport } from '../types.js';
import { log } from '../utils/logger.js';

/** VulnProtector — el Guardián: ¿esta persona es blanco fácil para ESTA llamada? */
export async function vulnProtectorAgent(input: CallInput, scout: CallScoutReport): Promise<VulnProtectorReport> {
  log('VulnProtector', `Evaluando a ${input.userProfile.name} (${input.userProfile.age} años) frente a esta llamada...`);

  // Corre en paralelo con ScamHunter, así que hace su propio barrido rápido de tácticas.
  const { text } = await audioTranscriptTool(input);
  const quickTactics = text ? detectPatterns(text).tactics : [];

  const hour = input.callContext?.hour ?? currentHour();
  const attemptsToday = input.callContext?.attemptsToday ?? 1;
  const score = vulnerabilityScoreTool({
    userProfile: input.userProfile,
    callType: scout.type,
    category: scout.category,
    quickTactics,
    hour,
    attemptsToday,
  });

  const vulnerable = input.userProfile.isVulnerable || input.userProfile.age > 60;
  const shouldBlockForThisUser = score.riskBoost >= 40 || (vulnerable && scout.type === 'ESTAFA' && scout.confidence >= 0.7);

  log(
    'VulnProtector',
    vulnerable
      ? `Usuario vulnerable, multiplicador x${score.vulnerabilityMultiplier}${score.riskBoost ? ` (riesgo +${score.riskBoost})` : ''}`
      : `Usuario no vulnerable, multiplicador x${score.vulnerabilityMultiplier}`,
  );

  return { ...score, shouldBlockForThisUser };
}

function currentHour(): number {
  return Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: config.timezone }).format(new Date()));
}
