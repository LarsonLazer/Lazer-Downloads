import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, sanitizeUrl, validateAdSenseSlot } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

const VALID_POSITIONS = ['header_banner', 'in_feed', 'sidebar_desktop', 'footer_banner'];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = String(body.name).trim();
  if (body.position !== undefined && VALID_POSITIONS.includes(body.position)) {
    updateData.position = body.position;
  }
  if (body.code !== undefined) {
    const raw = String(body.code).trim();
    if (!raw) {
      updateData.code = null;
    } else {
      const valid = validateAdSenseSlot(raw);
      if (!valid) {
        return NextResponse.json(
          { error: 'Código AdSense inválido. Apenas IDs numéricos ou ca-pub-XXXX são aceites.' },
          { status: 400 }
        );
      }
      updateData.code = valid;
    }
  }
  if (body.image_url !== undefined) updateData.image_url = sanitizeUrl(body.image_url);
  if (body.destination_url !== undefined) {
    updateData.destination_url = sanitizeUrl(body.destination_url);
  }
  if (body.active !== undefined) updateData.active = Boolean(body.active);

  const { data, error } = await db
    .from('advertisements')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ad: data });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const { id } = await context.params;
  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const { error } = await db.from('advertisements').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
