import { config, useWhatsApp } from '../config.js';
import { log } from '../utils/logger.js';

export interface AlertResult {
  sent: boolean;
  channel: 'whatsapp';
  detail: string;
}

/**
 * Alerta al hijo/a por WhatsApp Cloud API. Sin WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID
 * solo imprime el mensaje (modo mock). Nota: fuera de la ventana de 24h Meta exige plantilla aprobada.
 */
export async function sendGuardianAlert(to: string | undefined, text: string): Promise<AlertResult> {
  const recipient = (to || config.defaultGuardianPhone).replace(/[^\d]/g, '');
  if (!recipient) {
    log('WhatsApp', 'Sin guardianPhone ni GUARDIAN_PHONE: no hay a quién avisar');
    return { sent: false, channel: 'whatsapp', detail: 'sin destinatario' };
  }
  if (!useWhatsApp) {
    log('WhatsApp', `(mock) Alerta para +${recipient}: "${text}"`);
    return { sent: false, channel: 'whatsapp', detail: 'mock: faltan credenciales de WhatsApp Cloud API' };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${config.whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.whatsappToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: recipient, type: 'text', text: { body: text } }),
    });
    if (!res.ok) {
      const detail = `HTTP ${res.status}: ${await res.text()}`;
      log('WhatsApp', `Error enviando alerta: ${detail}`);
      return { sent: false, channel: 'whatsapp', detail };
    }
    log('WhatsApp', `Alerta enviada a +${recipient}`);
    return { sent: true, channel: 'whatsapp', detail: 'enviado' };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    log('WhatsApp', `Error enviando alerta: ${detail}`);
    return { sent: false, channel: 'whatsapp', detail };
  }
}
