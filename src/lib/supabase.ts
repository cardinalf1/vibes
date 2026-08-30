import { createClient } from '@supabase/supabase-js';

// Default Supabase project for Isha Vibes
const DEFAULT_URL = 'https://vtgjsdysbmpiipufdyxm.supabase.co';

// Retrieve credentials from Vite env or runtime localStorage override
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('vibes_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('vibes_supabase_anon_key') || '' : '';

export const supabaseUrl = (localUrl || envUrl || DEFAULT_URL).trim();
export const supabaseAnonKey = (localKey || envKey).trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem('vibes_supabase_url', url.trim());
  else localStorage.removeItem('vibes_supabase_url');

  if (key) localStorage.setItem('vibes_supabase_anon_key', key.trim());
  else localStorage.removeItem('vibes_supabase_anon_key');

  window.location.reload();
}
