import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`report:${ip}`, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas denúncias enviadas recentemente. Aguarda alguns minutos.' },
      { status: 429 }
    );
  }

  let body: {
    download_id?: string | null;
    reason?: string;
    description?: string;
    email?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const reason = (body.reason || '').trim();
  const description = (body.description || '').trim();
  const email = (body.email || '').trim();

  if (reason.length < 3 || description.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Preenche o motivo, descrição detalhada (mín. 10 caracteres) e um email válido.' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          'A base de dados Supabase ainda não está ligada neste ambiente. Configura as variáveis de ambiente para registar denúncias.',
      },
      { status: 503 }
    );
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) {
    return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
  }

  const { error } = await db.from('reports').insert({
    download_id: body.download_id || null,
    reason: reason.slice(0, 120),
    description: description.slice(0, 2000),
    email: email.slice(0, 180),
    status: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: 'Erro ao registar denúncia.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Denúncia registada com sucesso.' });
}
