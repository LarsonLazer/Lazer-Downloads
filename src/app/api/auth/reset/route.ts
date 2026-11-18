import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`auth:reset:${ip}`, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiados pedidos de recuperação. Aguarda 1 minuto.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Insere um email válido.' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Cliente Supabase indisponível.' }, { status: 503 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${request.nextUrl.origin}/auth/callback?next=/login`,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message.toLowerCase().includes('rate limit')
          ? 'Limite de envio de emails atingido no Supabase. Aguarda alguns minutos ou configura SMTP personalizado.'
          : error.message,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
