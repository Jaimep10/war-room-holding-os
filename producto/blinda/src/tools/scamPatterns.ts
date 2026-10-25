import type { Tactic } from '../types.js';

/** Minúsculas y sin tildes, para que "ganó" y "gano" coincidan. */
export function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

interface PatternRule {
  pattern: string;
  label: string;
  phrases: string[];
  tactics: Tactic[];
}

// Patrones de estafa / venta agresiva a adultos mayores en Ecuador (frases ya normalizadas).
export const PATTERN_RULES: PatternRule[] = [
  { pattern: 'FAMILIAR_DETENIDO', label: 'Familiar detenido / en problemas', phrases: ['detenido', 'preso', 'fianza', 'tuvo un accidente', 'esta en el hospital', 'soy yo mama', 'mami soy yo'], tactics: ['miedo', 'urgencia'] },
  { pattern: 'FALSO_SECUESTRO', label: 'Falso secuestro', phrases: ['secuestrado', 'secuestro', 'tenemos a su', 'rescate'], tactics: ['miedo', 'urgencia'] },
  { pattern: 'SUPLANTACION_AUTORIDAD', label: 'Suplantación de autoridad', phrases: ['iess', 'sri', 'fiscalia', 'policia nacional', 'registro civil', 'superintendencia', 'municipio'], tactics: ['autoridad'] },
  { pattern: 'SUPLANTACION_BANCO', label: 'Suplantación de banco', phrases: ['banco pichincha', 'banco guayaquil', 'produbanco', 'banco del pacifico', 'banco internacional', 'departamento de seguridad del banco'], tactics: ['autoridad'] },
  { pattern: 'CUENTA_BLOQUEADA', label: 'Cuenta / pensión bloqueada', phrases: ['cuenta bloqueada', 'cuenta esta bloqueada', 'cuenta suspendida', 'tarjeta bloqueada', 'pension suspendida', 'pension esta suspendida', 'jubilacion suspendida', 'deuda pendiente', 'multa'], tactics: ['miedo', 'urgencia'] },
  { pattern: 'PREMIO_FALSO', label: 'Premio falso', phrases: ['felicidades', 'gano', 'ganador', 'premio', 'sorteo', 'fue seleccionado', 'fue seleccionada'], tactics: ['premio'] },
  { pattern: 'BONO_GOBIERNO', label: 'Bono del gobierno falso', phrases: ['bono del gobierno', 'bono de desarrollo', 'bono para jubilados', 'subsidio'], tactics: ['premio', 'autoridad'] },
  { pattern: 'VENTA_AGRESIVA', label: 'Venta telefónica agresiva', phrases: ['promocion', 'oferta exclusiva', 'promocion exclusiva', 'le llamamos para ofrecer', 'plan de fibra', 'tarjeta de credito preaprobada', 'seguro de vida'], tactics: ['presion_venta'] },
];

// Tácticas que pueden aparecer en cualquier patrón.
const TACTIC_PHRASES: Record<Tactic, string[]> = {
  miedo: ['bloqueada', 'detenido', 'demanda', 'embargo', 'va a perder', 'problema legal'],
  urgencia: ['ahora mismo', 'hoy mismo', 'urgente', 'inmediatamente', 'ya mismo', 'solo por hoy', 'antes de las', 'deposite ya'],
  premio: [],
  autoridad: [],
  presion_venta: ['solo por hoy', 'ultima oportunidad', 'cupos limitados'],
  secreto: ['no le diga a nadie', 'no le cuente', 'no cuelgue', 'es confidencial', 'no avise'],
  datos_sensibles: ['clave', 'contrasena', 'codigo que le llego', 'codigo de verificacion', 'pin', 'numero de tarjeta', 'numero de cedula', 'cvv'],
  pago: ['deposite', 'deposito', 'transferencia', 'pagar el envio', 'pague', 'tarjeta de regalo', 'recarga', 'western union'],
};

export const TACTIC_WEIGHTS: Record<Tactic, number> = {
  miedo: 25, urgencia: 15, premio: 20, autoridad: 20, presion_venta: 10, secreto: 20, datos_sensibles: 30, pago: 25,
};

export interface PatternMatch {
  patterns: { pattern: string; label: string }[];
  tactics: Tactic[];
  matchedPhrases: string[];
}

export function detectPatterns(text: string): PatternMatch {
  const t = normalizeText(text);
  const patterns: PatternMatch['patterns'] = [];
  const tactics = new Set<Tactic>();
  const matched = new Set<string>();

  for (const rule of PATTERN_RULES) {
    const hits = rule.phrases.filter((p) => new RegExp(`\\b${p}\\b`).test(t));
    if (hits.length) {
      patterns.push({ pattern: rule.pattern, label: rule.label });
      rule.tactics.forEach((x) => tactics.add(x));
      hits.forEach((h) => matched.add(h));
    }
  }
  for (const [tactic, phrases] of Object.entries(TACTIC_PHRASES) as [Tactic, string[]][]) {
    const hits = phrases.filter((p) => new RegExp(`\\b${p}\\b`).test(t));
    if (hits.length) {
      tactics.add(tactic);
      hits.forEach((h) => matched.add(h));
    }
  }
  return { patterns, tactics: [...tactics], matchedPhrases: [...matched] };
}
