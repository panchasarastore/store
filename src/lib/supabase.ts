import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Custom storage key to share session across ports
export const STORAGE_KEY = 'sb-auth-token';

// Custom storage to share session across ports (localhost:4321 and localhost:8080)
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(`${key}=`));
    return cookie ? decodeURIComponent(cookie.substring(key.length + 1)) : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const domain = isLocal ? '' : '; domain=.pnsara.store';
    // Set cookie for the whole domain to share across subdomains
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${domain}`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const domain = isLocal ? '' : '; domain=.pnsara.store';
    document.cookie = `${key}=; path=/; max-age=-1; SameSite=Lax${domain}`;
  }
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: cookieStorage,
      storageKey: STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
