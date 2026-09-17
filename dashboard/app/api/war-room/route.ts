import { NextRequest, NextResponse } from "next/server";
import { buildAgentSystemPrompt, findAgentBySlug, getIdeaActual, readIdea } from "@/lib/memoria";
import { callAgentWithTools } from "@/lib/anthropic";
import type { AgentResponse } from "@/lib/types";

// Reunión War Room (Fase 3): 3 especialistas fijos, en CADENA (no en paralelo como
// "/api/team-meeting"), cada uno viendo lo que dijo el anterior sobre el MISMO proyecto,
// y al final agente-analista cierra con un resumen ejecutivo.
//
// El usuario pidió la secuencia como "agente-estrategia -> agente-marketing -> agente-finanzas".
// En este repo el especialista de estrategia se llama "director-estrategia" (no existe
// "agente-estrategia" en .claude/agents) — se usa el agente real que sí existe en vez de
// fallar o inventar uno; se documenta aquí para que quede claro, no es una sustitución
// silenciosa de un dato de negocio, es una corrección de nombre de archivo.
const WAR_ROOM_SLUGS = ["director-estrategia", "agente-marketing", "agente-finanzas"] as const;
const WAR_ROOM_LABELS: Record<string, string> = {
  "director-estrategia": "Estrategia",
  "agente-marketing": "Marketing",
  "agente-finanzas": "Finanzas",
};
const RESUMEN_FINAL_SLUG = "agente-analista";

interface Turno {
  slug: string;
  label: string;
  texto: string;
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  // contextoExtra: memoria del proyecto + PDF/Excel adjuntos, ya armados por el dashboard
  // (ChatPanel.tsx) — así la Reunión War Room no rompe lo que ya existía de Fase 2.
  const contextoExtra: string = (body?.contextoExtra || "").toString();
  const instruccion: string = (body?.instruccion || "").toString().trim();

  const pointer = getIdeaActual();
  if (!pointer.archivo) {
    return NextResponse.json({ error: "No hay ninguna IDEA-ACTUAL configurada." }, { status: 400 });
  }
  const idea = readIdea(pointer.archivo);

  const results: AgentResponse[] = [];
  const transcript: Turno[] = [];

  for (let i = 0; i < WAR_ROOM_SLUGS.length; i++) {
    const slug = WAR_ROOM_SLUGS[i];
    const label = WAR_ROOM_LABELS[slug] || slug;
    const agent = findAgentBySlug(slug);
    if (!agent) {
      results.push({
        agent: slug,
        ok: false,
        text: `Agente "${slug}" no existe en .claude/agents — no se puede completar la Reunión War Room.`,
      });
      break;
    }

    const anterior = transcript[transcript.length - 1] || null;
    const historialPrevio = transcript
      .slice(0, -1)
      .map((t) => `### ${t.label} (${t.slug}) dijo antes\n\n${t.texto}`)
      .join("\n\n---\n\n");

    const bloqueReunion = anterior
      ? [
          `# REUNIÓN WAR ROOM EN CURSO (turno ${i + 1} de ${WAR_ROOM_SLUGS.length} — tú eres ${label})`,
          `Estás en una reunión War Room. El agente anterior (${anterior.label}) dijo:`,
          `"""\n${anterior.texto}\n"""`,
          historialPrevio ? `Contexto adicional de turnos previos:\n\n${historialPrevio}` : "",
          "Aporta tu visión crítica y mejora la idea desde tu propio marco. No repitas lo que ya se dijo — cuestiónalo, complementa lo que falte, o corrígelo si no cuadra.",
        ]
          .filter(Boolean)
          .join("\n\n")
      : `# REUNIÓN WAR ROOM EN CURSO (turno 1 de ${WAR_ROOM_SLUGS.length} — tú abres la reunión como ${label})`;

    const userMessage = [
      `## IDEA ACTIVA (memoria/ideas/${idea.file})`,
      idea.content,
      contextoExtra ? `---\n\n${contextoExtra}` : "",
      bloqueReunion,
      `---\n\n### Instrucción del usuario\n\n${
        instruccion || "Da tu dictamen sobre esta idea desde tu rol, siguiendo tu propio formato de respuesta. Sé conciso: esto es una reunión de equipo, no un informe extenso."
      }`,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const systemPrompt = buildAgentSystemPrompt(agent.relPath);
      const { text, toolCalls } = await callAgentWithTools(systemPrompt, userMessage);
      results.push({
        agent: agent.slug,
        ok: true,
        text,
        ...(toolCalls.length ? { herramientas: toolCalls } : {}),
      });
      transcript.push({ slug: agent.slug, label, texto: text });
    } catch (err: any) {
      results.push({ agent: slug, ok: false, text: String(err?.message || err) });
      break; // un eslabón roto no debe pasar contexto corrupto al siguiente
    }
  }

  // Cierre: agente-analista sintetiza toda la reunión — solo si los 3 turnos anteriores
  // se completaron bien (si algo falló a la mitad, no tiene sentido pedir un resumen final).
  if (transcript.length === WAR_ROOM_SLUGS.length) {
    const resumenAgent = findAgentBySlug(RESUMEN_FINAL_SLUG);
    if (!resumenAgent) {
      results.push({
        agent: RESUMEN_FINAL_SLUG,
        ok: false,
        text: `Agente "${RESUMEN_FINAL_SLUG}" no existe en .claude/agents — no se pudo generar el resumen final.`,
      });
    } else {
      const transcripcionCompleta = transcript
        .map((t) => `## ${t.label} (${t.slug})\n\n${t.texto}`)
        .join("\n\n---\n\n");

      const userMessage = [
        `## IDEA ACTIVA (memoria/ideas/${idea.file})`,
        idea.content,
        contextoExtra ? `---\n\n${contextoExtra}` : "",
        `# RESUMEN FINAL DE LA REUNIÓN WAR ROOM`,
        `Se reunieron 3 especialistas sobre este proyecto (Estrategia, Marketing, Finanzas). Esto dijo cada uno, en orden:`,
        transcripcionCompleta,
        `---\n\n### Instrucción del usuario\n\nDa el RESUMEN EJECUTIVO FINAL de esta reunión: sintetiza los 3 puntos de vista, señala explícitamente si hay contradicciones entre ellos, y cierra con la acción concreta de los próximos 7 días que genere caja (tu propio protocolo). Si necesitas números que nadie te dio para calcular con calcularFinanzas, pídelos en vez de asumirlos.`,
      ]
        .filter(Boolean)
        .join("\n\n");

      try {
        const systemPrompt = buildAgentSystemPrompt(resumenAgent.relPath);
        const { text, toolCalls } = await callAgentWithTools(systemPrompt, userMessage);
        results.push({
          agent: resumenAgent.slug,
          ok: true,
          text,
          ...(toolCalls.length ? { herramientas: toolCalls } : {}),
        });
      } catch (err: any) {
        results.push({ agent: RESUMEN_FINAL_SLUG, ok: false, text: String(err?.message || err) });
      }
    }
  }

  return NextResponse.json({ results, idea: { file: idea.file, title: idea.title, giro: idea.giro } });
}
