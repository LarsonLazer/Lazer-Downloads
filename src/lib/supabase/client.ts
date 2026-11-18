import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    '';

  if (!url || !key || (!url.startsWith('https://') && !url.startsWith('http://'))) {
    return null;
  }

  if (!browserClient) {
    const isHttps =
      typeof window !== 'undefined' && window.location.protocol === 'https:';

    browserClient = createBrowserClient(url, key, {
      cookieOptions: isHttps
        ? { path: '/', sameSite: 'none', secure: true }
        : { path: '/', sameSite: 'lax', secure: false },
    });
  }
  return browserClient;
}
