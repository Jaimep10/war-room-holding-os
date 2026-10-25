import { findBlacklisted } from '../db/store.js';
import type { BlacklistedNumber } from '../db/seed.js';

export interface TruecallerResult {
  name: string | null;
  tags: string[];
  spamScore: number; // 0-10
}

export interface PhoneReputation {
  normalized: string;
  isPrivate: boolean;
  isMalformed: boolean;
  isTollFree: boolean;
  blacklist: BlacklistedNumber | null;
  truecaller: TruecallerResult;
}

// Mock de Truecaller: reemplazar por la API real cuando haya credenciales.
const TRUECALLER_MOCK: Record<string, TruecallerResult> = {
  '+593990000201': { name: 'CNT Ventas', tags: ['telemarketing'], spamScore: 8 },
  '+593990000202': { name: 'Movistar Promociones', tags: ['telemarketing'], spamScore: 8 },
  '+593990000203': { name: 'Claro Ventas', tags: ['telemarketing'], spamScore: 7 },
  '+593990000204': { name: 'Tarjetas Banco (ventas)', tags: ['telemarketing', 'banco'], spamScore: 7 },
  '+593990000301': { name: 'Farmacia del barrio', tags: ['negocio'], spamScore: 0 },
  '+593990000302': { name: 'Consultorio Dr. Médico', tags: ['salud'], spamScore: 0 },
};

const PRIVATE_VALUES = new Set(['', 'anonymous', 'private', 'unknown', 'restricted', 'privado', 'desconocido']);

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (PRIVATE_VALUES.has(trimmed.toLowerCase())) return '';
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('593')) return `+${digits}`;
  if (digits.startsWith('0')) return `+593${digits.slice(1)}`; // 0991234567 -> +593991234567
  return digits;
}

function isValidEcuador(n: string): boolean {
  // Móvil: +593 9X XXX XXXX (12 dígitos tras el +). Fijo: +593 [2-7] XXX XXXX.
  return /^\+5939\d{8}$/.test(n) || /^\+593[2-7]\d{7}$/.test(n) || /^\+5931800\d{6}$/.test(n);
}

export async function phoneReputationTool(rawPhone: string): Promise<PhoneReputation> {
  const normalized = normalizePhone(rawPhone);
  const isPrivate = normalized === '';
  const isEcuador = normalized.startsWith('+593');
  const isMalformed = !isPrivate && isEcuador && !isValidEcuador(normalized);

  return {
    normalized,
    isPrivate,
    isMalformed,
    isTollFree: normalized.startsWith('+5931800'),
    blacklist: isPrivate ? null : await findBlacklisted(normalized),
    truecaller: TRUECALLER_MOCK[normalized] ?? { name: null, tags: [], spamScore: 0 },
  };
}
