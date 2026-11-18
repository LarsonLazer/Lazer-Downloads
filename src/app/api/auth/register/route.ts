import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase não está configurado neste ambiente.' },
      { status: 503 }
    );
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`auth:register:${ip}`, 8, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas tentativas de registo. Aguarda 1 minuto.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const displayName = String(body?.displayName || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Insere um email válido.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'A palavra-passe deve ter pelo menos 6 caracteres.' },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Cliente Supabase indisponível.' }, { status: 503 });
  }

  const origin = request.nextUrl.origin;
  const resolvedName = displayName || email.split('@')[0];

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: resolvedName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (!error && data.user) {
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return NextResponse.json(
        { error: 'Este email já está registado. Tenta iniciar sessão ou recuperar a palavra-passe.' },
        { status: 409 }
      );
    }

    // If Supabase returned an active session (email confirmation disabled), user is logged in immediately
    if (data.session) {
      return NextResponse.json({
        ok: true,
        autoSignedIn: true,
        redirectTo: '/conta',
        message: 'Conta criada e sessão iniciada com sucesso.',
      });
    }

    return NextResponse.json({
      ok: true,
      autoSignedIn: false,
      message: 'Conta criada. Verifica o teu email para confirmar o registo antes de entrar.',
    });
  }

  // Fallback when Supabase free-tier built-in SMTP hits "email rate limit exceeded"
  const errMsg = (error?.message || '').toLowerCase();
  const serviceClient = createServiceRoleClient();
  if (serviceClient && (errMsg.includes('rate limit') || errMsg.includes('sending confirmation email'))) {
    const { data: created, error: adminErr } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: resolvedName },
    });

    if (adminErr) {
      const adminLower = adminErr.message.toLowerCase();
      if (adminLower.includes('already') || adminLower.includes('registered')) {
        return NextResponse.json(
          { error: 'Este email já está registado. Tenta iniciar sessão.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: adminErr.message }, { status: 400 });
    }

    if (created.user) {
      await serviceClient.from('profiles').upsert(
        {
          id: created.user.id,
          display_name: resolvedName,
          role: 'user',
          active: true,
        },
        { onConflict: 'id' }
      );

      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInErr) {
        return NextResponse.json({
          ok: true,
          autoSignedIn: true,
          redirectTo: '/conta',
          message: 'Conta criada e sessão iniciada com sucesso.',
        });
      }
    }
  }

  if (errMsg.includes('already') || errMsg.includes('registered')) {
    return NextResponse.json(
      { error: 'Este email já está registado. Tenta iniciar sessão.' },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: error?.message || 'Não foi possível criar a conta.' },
    { status: 400 }
  );
}
