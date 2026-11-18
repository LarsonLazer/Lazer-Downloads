import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ favorites: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('id, download_id, created_at, download:downloads(*, category:categories(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erro ao carregar favoritos.' }, { status: 500 });
  }

  return NextResponse.json({ favorites: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Inicia sessão para guardar favoritos.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.download_id) {
    return NextResponse.json({ error: 'download_id em falta.' }, { status: 400 });
  }

  const { error } = await supabase.from('favorites').upsert(
    {
      user_id: user.id,
      download_id: body.download_id,
    },
    { onConflict: 'user_id,download_id' }
  );

  if (error) {
    return NextResponse.json({ error: 'Erro ao guardar favorito.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const downloadId = request.nextUrl.searchParams.get('download_id');
  if (!downloadId) {
    return NextResponse.json({ error: 'download_id em falta.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('download_id', downloadId);

  if (error) {
    return NextResponse.json({ error: 'Erro ao remover favorito.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
