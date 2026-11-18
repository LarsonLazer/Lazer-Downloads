import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdminClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
  hasServiceRoleKey,
  isSupabaseConfigured,
} from './config';

export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Safe to ignore in Server Components where cookies are read-only.
        }
      },
    },
  });
}

export function createServiceRoleClient(): SupabaseClient | null {
  if (!isSupabaseConfigured() || !hasServiceRoleKey()) {
    return null;
  }

  return createSupabaseAdminClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
