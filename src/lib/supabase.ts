import { createClient } from '@supabase/supabase-js';

// Default Supabase project URL & public anon JWT key for Isha Vibes
const DEFAULT_URL = 'https://vtgjsdysbmpiipufdyxm.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z2pzZHlzYm1waWlwdWZkeXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTk0ODUsImV4cCI6MjEwMzY3NTQ4NX0.kpUFbsyIJm6KOWIBHwlj4FS0524jpJy65r9EFoGlO9A';

// Retrieve credentials from Vite env, runtime localStorage override, or default
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

let localUrl = typeof window !== 'undefined' ? localStorage.getItem('vibes_supabase_url') || '' : '';
let localKey = typeof window !== 'undefined' ? localStorage.getItem('vibes_supabase_anon_key') || '' : '';

// Purge any stale non-JWT publishable keys from previous configuration
if (typeof window !== 'undefined' && localKey && !localKey.startsWith('eyJ')) {
  localStorage.removeItem('vibes_supabase_anon_key');
  localKey = '';
}

export const supabaseUrl = (localUrl || envUrl || DEFAULT_URL).trim();
export const supabaseAnonKey = (localKey || envKey || DEFAULT_KEY).trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
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
