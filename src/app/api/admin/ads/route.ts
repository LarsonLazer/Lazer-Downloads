import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, sanitizeUrl, validateAdSenseSlot } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

const VALID_POSITIONS = ['header_banner', 'in_feed', 'sidebar_desktop', 'footer_banner'];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ ads: [] });

  const { data, error } = await db
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erro ao carregar anúncios.' }, { status: 500 });
  }

  return NextResponse.json({ ads: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.name || !VALID_POSITIONS.includes(body.position)) {
    return NextResponse.json(
      { error: 'Nome e posição válida do anúncio são obrigatórios.' },
      { status: 400 }
    );
  }

  const safeCode = body.code ? validateAdSenseSlot(String(body.code)) : null;
  if (body.code && String(body.code).trim() && !safeCode) {
    return NextResponse.json(
      {
        error:
          'Código publicitário inválido. Por segurança, insere apenas o ID de slot AdSense (ex: 1234567890 ou ca-pub-XXXX). Scripts HTML arbitrários são bloqueados.',
      },
      { status: 400 }
    );
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const { data, error } = await db
    .from('advertisements')
    .insert({
      name: String(body.name).trim(),
      position: body.position,
      code: safeCode,
      image_url: sanitizeUrl(body.image_url),
      destination_url: sanitizeUrl(body.destination_url),
      active: body.active !== false,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ad: data }, { status: 201 });
}
