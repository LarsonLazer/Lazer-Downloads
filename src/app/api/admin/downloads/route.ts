import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, sanitizeUrl, slugify } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ downloads: [] });

  const { data, error } = await db
    .from('downloads')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erro ao carregar downloads.' }, { status: 500 });
  }

  return NextResponse.json({ downloads: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.title || String(body.title).trim().length < 2) {
    return NextResponse.json({ error: 'O título do download é obrigatório.' }, { status: 400 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const title = String(body.title).trim();
  const slug = slugify(String(body.slug || title));
  if (!slug) {
    return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 });
  }

  const status =
    body.status === 'published' || body.status === 'archived' ? body.status : 'draft';

  const tags = Array.isArray(body.tags)
    ? body.tags.map((t: unknown) => String(t).trim().toLowerCase()).filter(Boolean)
    : typeof body.tags === 'string'
      ? body.tags
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

  const screenshots = Array.isArray(body.screenshots)
    ? body.screenshots
        .map((s: unknown) => sanitizeUrl(String(s)))
        .filter((s: string | null): s is string => Boolean(s))
    : [];

  const payload = {
    title,
    slug,
    description: String(body.description || '').trim(),
    short_description: String(body.short_description || '').trim(),
    category_id: body.category_id || null,
    thumbnail_url: sanitizeUrl(body.thumbnail_url),
    file_url: sanitizeUrl(body.file_url),
    external_download_url: sanitizeUrl(body.external_download_url),
    file_path: body.file_path ? String(body.file_path).trim() : null,
    file_name: body.file_name ? String(body.file_name).trim() : null,
    file_size: body.file_size ? String(body.file_size).trim() : null,
    file_type: body.file_type ? String(body.file_type).trim() : null,
    version: body.version ? String(body.version).trim() : null,
    operating_system: body.operating_system ? String(body.operating_system).trim() : null,
    developer: body.developer ? String(body.developer).trim() : null,
    author: body.author ? String(body.author).trim() : null,
    featured: Boolean(body.featured),
    popular: Boolean(body.popular),
    premium: Boolean(body.premium),
    status,
    instructions: body.instructions ? String(body.instructions).trim() : null,
    requirements: body.requirements ? String(body.requirements).trim() : null,
    security_notes: body.security_notes ? String(body.security_notes).trim() : null,
    tags,
    screenshots,
    published_at: status === 'published' ? new Date().toISOString() : null,
  };

  const { data, error } = await db
    .from('downloads')
    .insert(payload)
    .select('*, category:categories(*)')
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.code === '23505' ? 'Já existe um download com este slug.' : error.message },
      { status: error.code === '23505' ? 409 : 500 }
    );
  }

  return NextResponse.json({ download: data }, { status: 201 });
}
