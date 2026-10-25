import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { config, useSupabase } from '../config.js';
import { log } from '../utils/logger.js';
import { blacklistSeed, type BlacklistedNumber } from './seed.js';

export interface CallLog {
  id: string;
  phone: string;
  decision: string;
  risk_score: number;
  agents_output: unknown;
  created_at: string;
}

/**
 * Capa de datos. Con SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY usa Supabase;
 * sin ellas usa memoria con el mismo seed, para que `npm run dev` corra sin configurar nada.
 */
const supabase: SupabaseClient | null = useSupabase ? createClient(config.supabaseUrl, config.supabaseKey) : null;
const memoryLogs: CallLog[] = [];

export const storeMode = supabase ? 'supabase' : 'memoria';

export async function findBlacklisted(phone: string): Promise<BlacklistedNumber | null> {
  if (!supabase) return blacklistSeed.find((n) => n.phone === phone) ?? null;
  const { data, error } = await supabase.from('blacklisted_numbers').select('*').eq('phone', phone).maybeSingle();
  if (error) {
    log('DB', `Error consultando blacklist: ${error.message}`);
    return null;
  }
  return data as BlacklistedNumber | null;
}

export async function saveCallLog(entry: Omit<CallLog, 'id' | 'created_at'>): Promise<CallLog> {
  const row: CallLog = { id: randomUUID(), created_at: new Date().toISOString(), ...entry };
  if (!supabase) {
    memoryLogs.unshift(row);
    return row;
  }
  const { error } = await supabase.from('call_logs').insert(row);
  if (error) log('DB', `Error guardando call_log: ${error.message}`);
  return row;
}

export async function listCallLogs(limit = 20): Promise<CallLog[]> {
  if (!supabase) return memoryLogs.slice(0, limit);
  const { data, error } = await supabase.from('call_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) {
    log('DB', `Error leyendo call_logs: ${error.message}`);
    return [];
  }
  return data as CallLog[];
}
