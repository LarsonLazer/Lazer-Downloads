import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Email ou palavra-passe incorretos.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Conta ainda não confirmada. Verifica o teu email ou pede confirmação.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Demasiadas tentativas. Aguarda um momento antes de tentar novamente.';
  }
  return message || 'Não foi possível iniciar sessão.';
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase não está configurado neste ambiente.' },
      { status: 503 }
    );
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`auth:login:${ip}`, 15, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas tentativas de login. Aguarda 1 minuto.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const requestedRedirect = String(body?.redirectTo || '/admin');

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Preenche o email e a palavra-passe.' },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Cliente Supabase indisponível.' }, { status: 503 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json(
      { error: mapAuthError(error?.message || '') },
      { status: 401 }
    );
  }

  const serviceClient = createServiceRoleClient();
  const db = serviceClient || supabase;
  let { data: profile } = await db
    .from('profiles')
    .select('role, active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile && serviceClient) {
    const fallbackName =
      typeof data.user.user_metadata?.display_name === 'string' &&
      data.user.user_metadata.display_name.trim()
        ? data.user.user_metadata.display_name.trim()
        : email.split('@')[0];

    const { data: inserted } = await serviceClient
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          display_name: fallbackName,
          role: 'user',
          active: true,
        },
        { onConflict: 'id' }
      )
      .select('role, active')
      .maybeSingle();
    profile = inserted;
  }

  if (profile && !profile.active) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: 'Esta conta encontra-se bloqueada pela administração.' },
      { status: 403 }
    );
  }

  const safeRedirect = requestedRedirect.startsWith('/') ? requestedRedirect : '/admin';
  const target =
    profile?.role === 'admin'
      ? safeRedirect.startsWith('/admin')
        ? safeRedirect
        : '/admin'
      : '/conta';

  return NextResponse.json({ ok: true, redirectTo: target });
}
