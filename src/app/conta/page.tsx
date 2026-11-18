import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AccountClient } from '@/components/AccountClient';
import type { DownloadEvent, DownloadItem, Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Minha Conta',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    redirect('/login');
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/conta');
  }

  const [{ data: profile }, { data: favRows }, { data: eventRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('favorites')
      .select('download:downloads(*, category:categories(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('download_events')
      .select('id, download_id, user_id, created_at, source, download:downloads(id, title, slug, version)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  const favorites = (favRows || [])
    .map((r) => (r as unknown as { download: DownloadItem | null }).download)
    .filter((d): d is DownloadItem => Boolean(d));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <AccountClient
        email={user.email || ''}
        profile={(profile as Profile) || null}
        favorites={favorites}
        history={(eventRows as unknown as DownloadEvent[]) || []}
      />
    </div>
  );
}
