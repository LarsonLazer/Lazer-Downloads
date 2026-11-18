'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, History, LogOut, ShieldCheck, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './ToastProvider';
import type { DownloadEvent, DownloadItem, Profile } from '@/types/database';
import { DownloadCard } from './DownloadCard';

export function AccountClient({
  email,
  profile,
  favorites,
  history,
}: {
  email: string;
  profile: Profile | null;
  favorites: DownloadItem[];
  history: DownloadEvent[];
}) {
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut().catch(() => null);
      }
    } finally {
      showToast('Sessão terminada.', 'info');
      window.location.assign('/');
    }
  };

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0B0F14] text-[#00D084]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {profile?.display_name || email}
            </h1>
            <p className="text-xs text-[#A0AAB5]">
              {email} · Perfil: {profile?.role === 'admin' ? 'Administrador' : 'Utilizador'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-4 py-2.5 text-xs font-semibold text-[#0B0F14] hover:bg-[#00B874]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Abrir Painel Admin</span>
            </Link>
          )}
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0F14] px-4 py-2.5 text-xs font-medium text-white hover:border-white/25"
          >
            <LogOut className="w-4 h-4 text-[#A0AAB5]" />
            <span>Terminar sessão</span>
          </button>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#00D084]" />
          <h2 className="font-display text-xl font-bold text-white">Os teus favoritos</h2>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151B23] p-6 text-sm text-[#A0AAB5]">
            Ainda não guardaste nenhum ficheiro nos favoritos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#00D084]" />
          <h2 className="font-display text-xl font-bold text-white">Histórico de downloads</h2>
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151B23] p-6 text-sm text-[#A0AAB5]">
            Ainda não tens descargas registadas com esta conta.
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#151B23] divide-y divide-white/10">
            {history.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 text-sm"
              >
                <div>
                  {ev.download ? (
                    <Link
                      href={`/download/${ev.download.slug}`}
                      className="font-medium text-white hover:text-[#00D084]"
                    >
                      {ev.download.title}
                    </Link>
                  ) : (
                    <span className="text-[#A0AAB5]">Conteúdo removido</span>
                  )}
                </div>
                <span className="text-xs font-mono tabular-nums text-[#A0AAB5]">
                  {new Date(ev.created_at).toLocaleString('pt-PT')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
