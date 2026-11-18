import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, sanitizeUrl, slugify } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ categories: [] });

  const { data, error } = await db
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Erro ao carregar categorias.' }, { status: 500 });
  }

  return NextResponse.json({ categories: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.name || String(body.name).trim().length < 2) {
    return NextResponse.json({ error: 'Nome da categoria obrigatório.' }, { status: 400 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const name = String(body.name).trim();
  const slug = slugify(String(body.slug || name));

  const { data, error } = await db
    .from('categories')
    .insert({
      name,
      slug,
      description: String(body.description || '').trim(),
      icon: String(body.icon || 'Folder').trim(),
      image_url: sanitizeUrl(body.image_url),
      active: body.active !== false,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.code === '23505' ? 'Slug já existente.' : error.message },
      { status: error.code === '23505' ? 409 : 500 }
    );
  }

  return NextResponse.json({ category: data }, { status: 201 });
}
