import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const serviceDb = createServiceRoleClient();
  const db = serviceDb || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ users: [], recentEvents: [] });

  const [{ data: profiles }, { data: recentEvents }] = await Promise.all([
    db.from('profiles').select('*').order('created_at', { ascending: false }),
    db
      .from('download_events')
      .select('id, download_id, user_id, created_at, source, download:downloads(id, title, slug)')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  let emailMap = new Map<string, string>();
  if (serviceDb) {
    const { data: authUsers } = await serviceDb.auth.admin.listUsers({ page: 1, perPage: 200 });
    emailMap = new Map(
      (authUsers?.users || []).map((u) => [u.id, u.email || ''])
    );
  }

  const users = (profiles || []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) || '',
  }));

  return NextResponse.json({ users, recentEvents: recentEvents || [] });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: 'ID do utilizador obrigatório.' }, { status: 400 });
  }

  if (body.id === admin.userId && body.active === false) {
    return NextResponse.json(
      { error: 'Não podes bloquear a tua própria conta de administrador.' },
      { status: 400 }
    );
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const updateData: Record<string, unknown> = {};
  if (body.active !== undefined) updateData.active = Boolean(body.active);
  if (body.role === 'admin' || body.role === 'user') updateData.role = body.role;

  const { data, error } = await db
    .from('profiles')
    .update(updateData)
    .eq('id', body.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
