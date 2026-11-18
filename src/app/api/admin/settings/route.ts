import { NextResponse, type NextRequest } from 'next/server';
import { getPublicSettings } from '@/lib/data';
import { requireAdmin, sanitizeUrl } from '@/lib/security';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const settings = await getPublicSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Acesso reservado a administradores.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const current = await getPublicSettings();
  const nextSettings = {
    site_name: String(body.site_name ?? current.site_name).trim() || current.site_name,
    company_name: String(body.company_name ?? current.company_name).trim() || current.company_name,
    slogan: String(body.slogan ?? current.slogan).trim(),
    description: String(body.description ?? current.description).trim(),
    contact_email: String(body.contact_email ?? current.contact_email).trim(),
    logo_url: sanitizeUrl(body.logo_url) || current.logo_url,
    security_notice: String(body.security_notice ?? current.security_notice).trim(),
    ga_measurement_id: String(body.ga_measurement_id ?? current.ga_measurement_id).trim(),
    adsense_client_id: String(body.adsense_client_id ?? current.adsense_client_id).trim(),
    social_links: {
      github: sanitizeUrl(body.social_links?.github) || '',
      instagram: sanitizeUrl(body.social_links?.instagram) || '',
      youtube: sanitizeUrl(body.social_links?.youtube) || '',
      facebook: sanitizeUrl(body.social_links?.facebook) || '',
    },
  };

  const db = createServiceRoleClient() || (await createServerSupabaseClient());
  if (!db) return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });

  const { error } = await db
    .from('site_settings')
    .upsert({ key: 'general', value: nextSettings }, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: nextSettings });
}
