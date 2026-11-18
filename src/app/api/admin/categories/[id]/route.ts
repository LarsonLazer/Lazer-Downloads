import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, sanitizeUrl, slugify } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

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
  if (body.slug !== undefined) updateData.slug = slugify(String(body.slug));
  if (body.description !== undefined) updateData.description = String(body.description).trim();
  if (body.icon !== undefined) updateData.icon = String(body.icon).trim();
  if (body.image_url !== undefined) updateData.image_url = sanitizeUrl(body.image_url);
  if (body.active !== undefined) updateData.active = Boolean(body.active);

  const { data, error } = await db
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
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

  const { error } = await db.from('categories').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
