export type CallType = 'VENTA' | 'ESTAFA' | 'LEGITIMO';
export type Decision = 'BLOQUEAR' | 'ADVERTIR' | 'PERMITIR';
export type Tactic = 'miedo' | 'urgencia' | 'premio' | 'autoridad' | 'presion_venta' | 'secreto' | 'datos_sensibles' | 'pago';

export interface UserProfile {
  name: string;
  age: number;
  isVulnerable: boolean;
  /** Teléfono del hijo/a que recibe la alerta por WhatsApp (formato E.164). */
  guardianPhone?: string;
}

export interface CallContext {
  /** Hora local de la llamada (0-23). Si no viene, se usa la hora del servidor en America/Guayaquil. */
  hour?: number;
  /** Cuántas veces ha llamado este número hoy. */
  attemptsToday?: number;
}

export interface CallInput {
  phoneNumber: string;
  transcript?: string;
  audioStream?: string;
  userProfile: UserProfile;
  callContext?: CallContext;
}

export interface CallScoutReport {
  type: CallType;
  confidence: number; // 0-1
  category: string; // ej. 'SUPLANTACION_IESS', 'TELCO_VENTAS', 'PRIVADO'
  evidence: string[];
  riskScore: number; // 0-100
}

export interface ScamHunterReport {
  transcript: string;
  scamPattern: string | null;
  manipulationTactics: Tactic[];
  matchedPhrases: string[];
  riskScore: number; // 0-100
}

export interface VulnProtectorReport {
  vulnerabilityMultiplier: number;
  riskBoost: number;
  shouldBlockForThisUser: boolean;
  reasons: string[];
}

export interface BlindaResult {
  decision: Decision;
  reason: string;
  riskScore: number;
  agentReports: {
    callScout: CallScoutReport;
    scamHunter: ScamHunterReport;
    vulnProtector: VulnProtectorReport;
  };
  messageForMami: string;
  guardianAlert: { sent: boolean; channel: 'whatsapp'; detail: string };
  elapsedMs: number;
}
