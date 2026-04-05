/**
 * dashfin — Supabase persistence layer
 *
 * Configuración: las variables SUPABASE_URL y SUPABASE_ANON_KEY
 * se leen desde env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * o quedan vacías (fallback a localStorage puro).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// ---------- CRUD ----------

export async function fetchRegistros<T>(): Promise<T[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('registros_mensuales')
    .select('*')
    .order('date', { ascending: true });
  if (error) {
    console.error('[supabase] fetchRegistros error:', error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export async function upsertRegistros<T extends { id: string }>(registros: T[]): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from('registros_mensuales')
    .upsert(registros, { onConflict: 'id' });
  if (error) {
    console.error('[supabase] upsertRegistros error:', error.message);
    return false;
  }
  return true;
}

export async function deleteRegistro(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from('registros_mensuales')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('[supabase] deleteRegistro error:', error.message);
    return false;
  }
  return true;
}
