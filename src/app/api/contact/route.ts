import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`contact:${ip}`, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas mensagens enviadas. Aguarda um minuto.' },
      { status: 429 }
    );
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();

  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    subject.length < 3 ||
    message.length < 10
  ) {
    return NextResponse.json(
      { error: 'Verifica todos os campos: nome, email válido, assunto e mensagem (mín. 10 caracteres).' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          'A base de dados Supabase não está configurada neste ambiente para guardar mensagens de contacto.',
      },
      { status: 503 }
    );
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) {
    return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
  }

  const { error } = await db.from('contact_messages').insert({
    name: name.slice(0, 120),
    email: email.slice(0, 180),
    subject: subject.slice(0, 160),
    message: message.slice(0, 3000),
  });

  if (error) {
    return NextResponse.json({ error: 'Não foi possível enviar a mensagem.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Mensagem enviada com sucesso.' });
}
