import { createServerSupabaseClient } from './supabase/server';
import { sanitizeUrl, slugify } from './format';
import type { Profile } from '@/types/database';

export { sanitizeUrl, slugify };

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: maxRequests - existing.count };
}

export function validateAdSenseSlot(code: string | null | undefined): string | null {
  if (!code) return null;
  const trimmed = code.trim();
  if (!trimmed) return null;
  // Allow numeric AdSense slot IDs or ca-pub-XXXX/slot format only (blocks arbitrary HTML/script injection)
  if (/^(ca-pub-\d{10,20}|slot:\d{6,16}|\d{6,16})$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return headers.get('x-real-ip') || 'unknown';
}

export async function requireAdmin(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile;
} | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'admin' || !profile.active) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile as Profile,
  };
}
