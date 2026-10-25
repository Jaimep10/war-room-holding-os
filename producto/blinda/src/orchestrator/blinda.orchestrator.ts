import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { callScoutAgent, categoryLabel } from '../agents/callScout.agent.js';
import { scamHunterAgent } from '../agents/scamHunter.agent.js';
import { vulnProtectorAgent } from '../agents/vulnProtector.agent.js';
import { saveCallLog } from '../db/store.js';
import { sendGuardianAlert } from '../notifications/whatsapp.js';
import type { BlindaResult, CallInput, CallScoutReport, Decision, ScamHunterReport, VulnProtectorReport } from '../types.js';
import { decisionColor, divider, log } from '../utils/logger.js';

const BlindaState = Annotation.Root({
  input: Annotation<CallInput>,
  callScoutReport: Annotation<CallScoutReport | undefined>,
  scamHunterReport: Annotation<ScamHunterReport | undefined>,
  vulnProtectorReport: Annotation<VulnProtectorReport | undefined>,
  verdict: Annotation<Omit<BlindaResult, 'agentReports' | 'elapsedMs'> | undefined>,
});
type State = typeof BlindaState.State;

// Paso 1: CallScout identifica el número.
async function callScoutNode(state: State) {
  log('ORCHESTRATOR', 'Delegando a CallScout...');
  return { callScoutReport: await callScoutAgent(state.input) };
}

// Paso 2: ScamHunter y VulnProtector en paralelo (mismo superstep de LangGraph).
async function scamHunterNode(state: State) {
  return { scamHunterReport: await scamHunterAgent(state.input) };
}
async function vulnProtectorNode(state: State) {
  return { vulnProtectorReport: await vulnProtectorAgent(state.input, state.callScoutReport!) };
}

// Paso 3: junta los 3 reportes y decide.
async function decideNode(state: State) {
  const scout = state.callScoutReport!;
  const hunter = state.scamHunterReport!;
  const vuln = state.vulnProtectorReport!;
  log('ORCHESTRATOR', 'Juntando los 3 reportes...');

  let base = Math.max(scout.riskScore, hunter.riskScore);
  if (scout.type === 'ESTAFA' && hunter.riskScore >= 40) base += 10; // número y contenido se corroboran
  if (scout.type === 'LEGITIMO' && scout.confidence >= 0.7 && hunter.riskScore < 30) base = Math.min(base, 10);
  // El refuerzo por vulnerabilidad solo aplica si la llamada ya tiene algo de riesgo.
  const riskScore = Math.min(100, base + (base >= 20 ? vuln.riskBoost : 0));

  let decision: Decision = riskScore >= 70 ? 'BLOQUEAR' : riskScore >= 40 ? 'ADVERTIR' : 'PERMITIR';
  if (vuln.shouldBlockForThisUser && riskScore >= 50) decision = 'BLOQUEAR';

  const reason = buildReason(scout, hunter, vuln);
  const guardianAlert =
    decision === 'PERMITIR'
      ? { sent: false, channel: 'whatsapp' as const, detail: 'no aplica: llamada permitida' }
      : await sendGuardianAlert(
          state.input.userProfile.guardianPhone,
          `BLINDA: ${decision === 'BLOQUEAR' ? 'bloqueé' : 'advertí sobre'} una llamada a ${state.input.userProfile.name} desde ${state.input.phoneNumber || 'número privado'}. Riesgo ${riskScore}/100. ${reason}`,
        );
  const messageForMami = buildMessage(decision, state.input, scout, hunter, guardianAlert.sent);

  log('ORCHESTRATOR', `DECISIÓN FINAL: ${decisionColor(decision, decision)} (Risk ${riskScore}/100)`);
  return { verdict: { decision, reason, riskScore, messageForMami, guardianAlert } };
}

function buildReason(scout: CallScoutReport, hunter: ScamHunterReport, vuln: VulnProtectorReport): string {
  const parts = [`Número: ${scout.type} ${categoryLabel(scout.category)} (${Math.round(scout.confidence * 100)}%)`];
  if (hunter.scamPattern) parts.push(`Contenido: ${hunter.scamPattern} [${hunter.manipulationTactics.join(', ')}]`);
  if (vuln.reasons.length) parts.push(`Usuario: ${vuln.reasons.join('; ')}`);
  return parts.join(' | ');
}

function buildMessage(decision: Decision, input: CallInput, scout: CallScoutReport, hunter: ScamHunterReport, familyAlerted: boolean): string {
  const name = input.userProfile.name;
  if (decision === 'PERMITIR') return `${name}, esta llamada parece segura. Igual, nunca des tus claves por teléfono.`;

  const isSale = scout.type === 'VENTA' && (!hunter.scamPattern || hunter.scamPattern === 'Venta telefónica agresiva');
  const isFamily = /FAMILIAR|SECUESTRO/.test(scout.category) || /Familiar|secuestro/.test(hunter.scamPattern ?? '');
  const what = isSale ? 'una venta insistente' : `una posible estafa (${hunter.scamPattern ?? categoryLabel(scout.category).toLowerCase()})`;
  const tip = isSale
    ? 'No tienes que aceptar nada por teléfono.'
    : isFamily
      ? 'Si alguien dice ser tu hijo/a o nieto/a en problemas, cuelga y llámale tú directamente.'
      : 'Ningún banco, IESS ni SRI te pide claves ni depósitos por teléfono.';
  const family = familyAlerted ? ' Ya le avisé a tu familia.' : '';

  if (decision === 'BLOQUEAR') return `${name}, colgué una llamada por tu seguridad: era ${what}. ${tip}${family}`;
  return `${name}, cuidado con esta llamada: puede ser ${what}. No des claves ni hagas depósitos. ${tip}${family}`;
}

export const blindaGraph = new StateGraph(BlindaState)
  .addNode('call_scout', callScoutNode)
  .addNode('scam_hunter', scamHunterNode)
  .addNode('vuln_protector', vulnProtectorNode)
  .addNode('decide', decideNode)
  .addEdge(START, 'call_scout')
  .addEdge('call_scout', 'scam_hunter')
  .addEdge('call_scout', 'vuln_protector')
  .addEdge(['scam_hunter', 'vuln_protector'], 'decide')
  .addEdge('decide', END)
  .compile();

/** El jefe: recibe la llamada, delega a los agentes, guarda el log y devuelve la decisión. */
export async function analyzeCall(input: CallInput): Promise<BlindaResult> {
  const started = Date.now();
  divider();
  log('ORCHESTRATOR', `Llamada entrante de ${input.phoneNumber || '(privado)'} para ${input.userProfile.name}`);

  const state = await blindaGraph.invoke({ input });
  const result: BlindaResult = {
    ...state.verdict!,
    agentReports: {
      callScout: state.callScoutReport!,
      scamHunter: state.scamHunterReport!,
      vulnProtector: state.vulnProtectorReport!,
    },
    elapsedMs: Date.now() - started,
  };

  await saveCallLog({ phone: input.phoneNumber, decision: result.decision, risk_score: result.riskScore, agents_output: result.agentReports });
  divider();
  return result;
}
