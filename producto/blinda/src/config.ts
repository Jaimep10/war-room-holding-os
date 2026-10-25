import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3000),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  whatsappToken: process.env.WHATSAPP_TOKEN ?? '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
  defaultGuardianPhone: process.env.GUARDIAN_PHONE ?? '',
  timezone: 'America/Guayaquil',
};

export const useSupabase = Boolean(config.supabaseUrl && config.supabaseKey);
export const useWhatsApp = Boolean(config.whatsappToken && config.whatsappPhoneNumberId);
