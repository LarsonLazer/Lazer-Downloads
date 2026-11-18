import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isSupabaseConfigured();
  let schemaReady = false;

  if (configured) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('categories').select('id').limit(1);
        schemaReady = !error;
      }
    } catch {
      schemaReady = false;
    }
  }

  return NextResponse.json({
    status: 'ok',
    service: 'lazer-downloads',
    supabaseConfigured: configured,
    schemaReady,
    timestamp: new Date().toISOString(),
  });
}
