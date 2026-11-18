import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'lazer-downloads',
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
