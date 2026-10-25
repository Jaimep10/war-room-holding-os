export interface TranscriptResult {
  text: string;
  source: 'texto' | 'whisper-mock' | 'vacio';
}

// Mock de Whisper: mientras no haya transcripción real, el audioStream se "transcribe"
// a una frase de prueba. Si audioStream es una de estas claves se usa esa frase.
const WHISPER_MOCK: Record<string, string> = {
  premio: 'Felicidades, ganó un premio de 5000 dólares, solo tiene que pagar el envío hoy mismo.',
  detenido: 'Mamá, soy yo, estoy detenido, no le diga a nadie, necesito que deposite ya para la fianza.',
  banco: 'Le llamamos del Banco Pichincha, su cuenta está bloqueada, confírmeme la clave para reactivarla.',
  venta: 'Buenas tardes, le llamamos de CNT con una promoción exclusiva de fibra, solo por hoy.',
};
const DEFAULT_MOCK = WHISPER_MOCK.premio;

export async function audioTranscriptTool(input: { transcript?: string; audioStream?: string }): Promise<TranscriptResult> {
  if (input.transcript?.trim()) return { text: input.transcript.trim(), source: 'texto' };
  if (input.audioStream) {
    return { text: WHISPER_MOCK[input.audioStream.trim().toLowerCase()] ?? DEFAULT_MOCK, source: 'whisper-mock' };
  }
  return { text: '', source: 'vacio' };
}
