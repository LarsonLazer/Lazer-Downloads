import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ reports: [] });

  const { data, error } = await db
    .from('reports')
    .select('*, download:downloads(id, title, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erro ao carregar denúncias.' }, { status: 500 });
  }

  return NextResponse.json({ reports: data || [] });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.id || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(body.status)) {
    return NextResponse.json({ error: 'Dados da denúncia inválidos.' }, { status: 400 });
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const { data, error } = await db
    .from('reports')
    .update({ status: body.status })
    .eq('id', body.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optionally unpublish the reported download immediately when resolving a valid takedown
  if (body.unpublishDownload && data.download_id) {
    await db.from('downloads').update({ status: 'archived' }).eq('id', data.download_id);
  }

  return NextResponse.json({ report: data });
}
