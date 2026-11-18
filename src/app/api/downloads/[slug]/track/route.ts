import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, sanitizeUrl } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Base de dados Supabase não configurada neste ambiente.' },
      { status: 503 }
    );
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`dl:${ip}:${slug}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiados pedidos de download. Aguarda um minuto e tenta novamente.' },
      { status: 429 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const serviceClient = createServiceRoleClient();
  const db = serviceClient || supabase;

  if (!db) {
    return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
  }

  const { data: item, error: fetchError } = await db
    .from('downloads')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (fetchError || !item) {
    return NextResponse.json(
      { error: 'Ficheiro não encontrado ou indisponível para download.' },
      { status: 404 }
    );
  }

  let currentUserId: string | null = null;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id ?? null;
  }

  let resolvedUrl: string | null = null;
  if (item.file_path && serviceClient) {
    const { data: signedData, error: signedError } = await serviceClient.storage
      .from('downloads')
      .createSignedUrl(item.file_path, 120, {
        download: item.file_name || undefined,
      });

    if (!signedError && signedData?.signedUrl) {
      resolvedUrl = signedData.signedUrl;
    }
  }

  if (!resolvedUrl) {
    resolvedUrl = sanitizeUrl(item.file_url) || sanitizeUrl(item.external_download_url);
  }

  if (!resolvedUrl) {
    return NextResponse.json(
      { error: 'Nenhum ficheiro ou link de download válido configurado para este conteúdo.' },
      { status: 422 }
    );
  }

  let updatedCount = Number(item.download_count || 0);
  if (serviceClient) {
    const { data: rpcCount, error: rpcError } = await serviceClient.rpc(
      'record_download_and_increment',
      {
        p_download_id: item.id,
        p_user_id: currentUserId,
        p_source: 'web',
      }
    );

    if (!rpcError && typeof rpcCount === 'number') {
      updatedCount = rpcCount;
    } else if (!rpcError && typeof rpcCount === 'string') {
      updatedCount = Number(rpcCount) || updatedCount + 1;
    }
  }

  return NextResponse.json({
    downloadUrl: resolvedUrl,
    downloadCount: updatedCount,
    fileName: item.file_name || item.title,
    fileSize: item.file_size,
    securityNotice:
      item.security_notes ||
      'Verifica o nome e a extensão do ficheiro antes de executar. Mantém o teu antivírus atualizado.',
  });
}
