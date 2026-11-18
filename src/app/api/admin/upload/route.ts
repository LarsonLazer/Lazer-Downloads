import { NextResponse, type NextRequest } from 'next/server';
import { UPLOAD_RULES } from '@/lib/constants';
import { requireAdmin, slugify } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

type BucketName = keyof typeof UPLOAD_RULES;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Pedido multipart inválido.' }, { status: 400 });
  }

  const file = formData.get('file');
  const bucketRaw = String(formData.get('bucket') || '').trim();

  if (!(bucketRaw in UPLOAD_RULES)) {
    return NextResponse.json({ error: 'Bucket de destino inválido.' }, { status: 400 });
  }

  const bucket = bucketRaw as BucketName;
  const rule = UPLOAD_RULES[bucket];

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Nenhum ficheiro enviado.' }, { status: 400 });
  }

  if (file.size <= 0 || file.size > rule.maxBytes) {
    return NextResponse.json(
      { error: `Tamanho inválido. Limite máximo para "${bucket}": ${formatBytes(rule.maxBytes)}.` },
      { status: 400 }
    );
  }

  const lowerName = file.name.toLowerCase();
  const extIndex = lowerName.lastIndexOf('.');
  const ext = extIndex >= 0 ? lowerName.slice(extIndex) : '';

  if (!ext || !(rule.allowedExtensions as readonly string[]).includes(ext)) {
    return NextResponse.json(
      { error: `Extensão de ficheiro não permitida (${ext || 'desconhecida'}) para o bucket "${bucket}".` },
      { status: 400 }
    );
  }

  if ('allowedMimeTypes' in rule && file.type) {
    if (!(rule.allowedMimeTypes as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo MIME não permitido: ${file.type}.` },
        { status: 400 }
      );
    }
  }

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) {
    return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });
  }

  const baseName = slugify(file.name.slice(0, extIndex > 0 ? extIndex : undefined)) || 'ficheiro';
  const objectPath = `${Date.now()}-${baseName}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await db.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json(
      { error: `Falha ao enviar para Storage: ${uploadError.message}` },
      { status: 500 }
    );
  }

  let publicUrl: string | null = null;
  if (bucket !== 'downloads') {
    const { data } = db.storage.from(bucket).getPublicUrl(objectPath);
    publicUrl = data.publicUrl;
  }

  return NextResponse.json({
    bucket,
    path: objectPath,
    publicUrl,
    fileName: file.name,
    fileSize: formatBytes(file.size),
    fileType: ext.replace('.', '').toUpperCase(),
  });
}
