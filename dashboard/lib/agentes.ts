import { buildAgentSystemPrompt, findAgentBySlug, listAgents } from "./memoria";
import type { AgentSummary } from "./types";

/**
 * Registro de agentes del dashboard — ANTI-CLON.
 *
 * Este archivo es el punto único por el que el dashboard pide el systemPrompt
 * de un agente. No hay ningún prompt "por defecto", ni un fallback al primer
 * agente de la lista, ni una constante compartida que dos agentes puedan
 * terminar importando por accidente: getSystemPrompt(slug) SIEMPRE arma el
 * prompt leyendo la definición y la memoria individual de ESE slug puntual
 * (vía buildAgentSystemPrompt(), en lib/memoria.ts, que a su vez lee SOLO
 * memoria/agentes/<slug>.md — nunca la de otro agente). Un slug que no existe
 * lanza un error explícito en vez de devolver silenciosamente el prompt de
 * otro agente (que es exactamente el bug de "clon" que esto existe para
 * evitar).
 *
 * ABIERTO: no hardcodea la lista de agentes a mano -- se arma dinámicamente
 * desde .claude/agents/ (listAgents(), en lib/memoria.ts). Un agente nuevo
 * queda disponible acá solo con crear su archivo .md, sin tocar este archivo.
 */

export function listarAgentes(): AgentSummary[] {
  return listAgents();
}

/**
 * El systemPrompt INDIVIDUAL de un agente puntual. Nunca comparte texto con
 * el de otro agente salvo la "Ley Suprema del Equipo" (memoria/PRINCIPIOS-
 * DEL-EQUIPO.md), que es doctrina común a todo el equipo por diseño, no un
 * clon accidental.
 */
export function getSystemPrompt(slug: string): string {
  const agente = findAgentBySlug(slug);
  if (!agente) {
    throw new Error(
      `Agente '${slug}' no existe en .claude/agents/. No hay prompt por defecto ni fallback a otro agente -- corrige el slug.`
    );
  }
  return buildAgentSystemPrompt(agente.relPath);
}

export interface ChequeoAntiClon {
  ok: boolean;
  totalAgentes: number;
  colisiones: { promptIdenticoEntre: string[] }[];
}

/**
 * Chequeo anti-clon real (no solo de convención de código): arma el
 * systemPrompt de TODOS los agentes reales y falla si dos terminan siendo
 * IDÉNTICOS -- eso significaría que alguno está devolviendo, de hecho, el
 * prompt de otro agente. Pensado para correrse en dev / antes de un deploy
 * (arma ~20 prompts completos, no es para llamarlo en cada mensaje de chat).
 */
export function verificarAntiClon(): ChequeoAntiClon {
  const agentes = listarAgentes();
  const porPrompt = new Map<string, string[]>();

  for (const agente of agentes) {
    const prompt = getSystemPrompt(agente.slug);
    const arr = porPrompt.get(prompt) ?? [];
    arr.push(agente.slug);
    porPrompt.set(prompt, arr);
  }

  const colisiones = Array.from(porPrompt.values())
    .filter((slugs) => slugs.length > 1)
    .map((slugs) => ({ promptIdenticoEntre: slugs }));

  return {
    ok: colisiones.length === 0,
    totalAgentes: agentes.length,
    colisiones,
  };
}
