import { phoneReputationTool } from '../tools/phoneReputation.tool.js';
import type { CallInput, CallScoutReport } from '../types.js';
import { log } from '../utils/logger.js';

/** CallScout — el Investigador: ¿quién llama? */
export async function callScoutAgent(input: CallInput): Promise<CallScoutReport> {
  log('CallScout', `Investigando ${input.phoneNumber || '(sin número)'}...`);
  const rep = await phoneReputationTool(input.phoneNumber);
  const report = classify(rep);
  const pct = Math.round(report.confidence * 100);
  log('CallScout', `Número identificado como ${report.type} ${categoryLabel(report.category)} con ${pct}% confianza`);
  return report;
}

function classify(rep: Awaited<ReturnType<typeof phoneReputationTool>>): CallScoutReport {
  if (rep.isPrivate) {
    return { type: 'ESTAFA', confidence: 0.5, category: 'NUMERO_PRIVADO', riskScore: 45, evidence: ['Número oculto / privado: táctica común para evitar ser reportado'] };
  }
  if (rep.isMalformed) {
    return { type: 'ESTAFA', confidence: 0.6, category: 'NUMERO_SPOOFEADO', riskScore: 55, evidence: [`${rep.normalized} no es un número ecuatoriano válido: probable suplantación (spoofing)`] };
  }

  const bl = rep.blacklist;
  if (bl?.type === 'ESTAFA') {
    const confidence = Math.min(0.99, 0.7 + (Math.min(bl.reports_count, 400) / 400) * 0.25);
    return {
      type: 'ESTAFA',
      confidence,
      category: bl.scam_category,
      riskScore: Math.round(confidence * 100),
      evidence: [`Lista negra Ecuador: ${bl.reports_count} reportes (${bl.scam_category}), último ${bl.last_report}`],
    };
  }
  if (bl?.type === 'VENTA') {
    const evidence = [`Lista negra: ${bl.reports_count} reportes de venta (${bl.scam_category})`];
    if (rep.truecaller.name) evidence.push(`Truecaller: "${rep.truecaller.name}" spamScore ${rep.truecaller.spamScore}/10`);
    return { type: 'VENTA', confidence: 0.9, category: bl.scam_category, riskScore: 35, evidence };
  }

  if (rep.truecaller.spamScore >= 6) {
    return { type: 'VENTA', confidence: 0.75, category: 'TELEMARKETING', riskScore: 30, evidence: [`Truecaller: "${rep.truecaller.name}" marcado como spam (${rep.truecaller.spamScore}/10)`] };
  }
  if (rep.truecaller.name && rep.truecaller.spamScore === 0) {
    return { type: 'LEGITIMO', confidence: 0.8, category: 'IDENTIFICADO', riskScore: 5, evidence: [`Truecaller: identificado como "${rep.truecaller.name}" sin reportes`] };
  }
  if (rep.isTollFree) {
    return { type: 'VENTA', confidence: 0.6, category: 'CALL_CENTER_1800', riskScore: 25, evidence: ['Línea 1800: típicamente call center comercial'] };
  }
  if (!rep.normalized.startsWith('+593')) {
    return { type: 'LEGITIMO', confidence: 0.3, category: 'INTERNACIONAL_DESCONOCIDO', riskScore: 35, evidence: [`Número internacional (${rep.normalized}) sin reportes`] };
  }
  return { type: 'LEGITIMO', confidence: 0.5, category: 'SIN_REPORTES', riskScore: 15, evidence: ['Número ecuatoriano válido, sin reportes en lista negra ni Truecaller'] };
}

export function categoryLabel(category: string): string {
  return category.replace(/^SUPLANTACION_/, '').replace(/_/g, ' ');
}
