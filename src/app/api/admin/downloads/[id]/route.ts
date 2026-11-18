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
  if (!body) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const updateData: Record<string, unknown> = {};

  if (body.title !== undefined) updateData.title = String(body.title).trim();
  if (body.slug !== undefined) updateData.slug = slugify(String(body.slug));
  if (body.description !== undefined) updateData.description = String(body.description).trim();
  if (body.short_description !== undefined) {
    updateData.short_description = String(body.short_description).trim();
  }
  if (body.category_id !== undefined) updateData.category_id = body.category_id || null;
  if (body.thumbnail_url !== undefined) updateData.thumbnail_url = sanitizeUrl(body.thumbnail_url);
  if (body.file_url !== undefined) updateData.file_url = sanitizeUrl(body.file_url);
  if (body.external_download_url !== undefined) {
    updateData.external_download_url = sanitizeUrl(body.external_download_url);
  }
  if (body.file_path !== undefined) updateData.file_path = body.file_path || null;
  if (body.file_name !== undefined) updateData.file_name = body.file_name || null;
  if (body.file_size !== undefined) updateData.file_size = body.file_size || null;
  if (body.file_type !== undefined) updateData.file_type = body.file_type || null;
  if (body.version !== undefined) updateData.version = body.version || null;
  if (body.operating_system !== undefined) updateData.operating_system = body.operating_system || null;
  if (body.developer !== undefined) updateData.developer = body.developer || null;
  if (body.author !== undefined) updateData.author = body.author || null;
  if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
  if (body.popular !== undefined) updateData.popular = Boolean(body.popular);
  if (body.premium !== undefined) updateData.premium = Boolean(body.premium);
  if (body.instructions !== undefined) updateData.instructions = body.instructions || null;
  if (body.requirements !== undefined) updateData.requirements = body.requirements || null;
  if (body.security_notes !== undefined) updateData.security_notes = body.security_notes || null;

  if (body.tags !== undefined) {
    updateData.tags = Array.isArray(body.tags)
      ? body.tags.map((t: unknown) => String(t).trim().toLowerCase()).filter(Boolean)
      : typeof body.tags === 'string'
        ? body.tags
            .split(',')
            .map((t: string) => t.trim().toLowerCase())
            .filter(Boolean)
        : [];
  }

  if (body.screenshots !== undefined && Array.isArray(body.screenshots)) {
    updateData.screenshots = body.screenshots
      .map((s: unknown) => sanitizeUrl(String(s)))
      .filter((s: string | null): s is string => Boolean(s));
  }

  if (body.status === 'published' || body.status === 'draft' || body.status === 'archived') {
    updateData.status = body.status;
    if (body.status === 'published') {
      updateData.published_at = body.published_at || new Date().toISOString();
    }
  }

  const { data, error } = await db
    .from('downloads')
    .update(updateData)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ download: data });
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

  const { error } = await db.from('downloads').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
