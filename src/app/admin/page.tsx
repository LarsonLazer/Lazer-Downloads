import React from 'react';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  Download,
  Flag,
  FolderKanban,
  Package,
  Plus,
} from 'lucide-react';
import { getAdminStats } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const maxDaily = Math.max(1, ...stats.dailySeries.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-sm text-[#A0AAB5] mt-1">
            Resumo de conteúdos, categorias, descargas e atividade da plataforma.
          </p>
        </div>

        <Link
          href="/admin/downloads"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-4 py-2.5 text-xs font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo download</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#151B23] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0AAB5]">
            <span>Downloads publicados</span>
            <Package className="w-4 h-4 text-[#00D084]" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-2xl font-bold text-white">
            {stats.totalDownloads.toLocaleString('pt-PT')}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151B23] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0AAB5]">
            <span>Total de categorias</span>
            <FolderKanban className="w-4 h-4 text-[#00D084]" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-2xl font-bold text-white">
            {stats.totalCategories.toLocaleString('pt-PT')}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151B23] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0AAB5]">
            <span>Downloads registados</span>
            <Download className="w-4 h-4 text-[#00D084]" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-2xl font-bold text-white">
            {stats.totalDownloadEvents.toLocaleString('pt-PT')}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151B23] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0AAB5]">
            <span>Downloads de hoje</span>
            <Activity className="w-4 h-4 text-[#00D084]" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-2xl font-bold text-white">
            {stats.todayDownloads.toLocaleString('pt-PT')}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151B23] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0AAB5]">
            <span>Últimos 7 dias</span>
            <BarChart3 className="w-4 h-4 text-[#00D084]" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-2xl font-bold text-white">
            {stats.last7DaysDownloads.toLocaleString('pt-PT')}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151B23] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0AAB5]">
            <span>Denúncias pendentes</span>
            <Flag className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-2xl font-bold text-white">
            {stats.pendingReports.toLocaleString('pt-PT')}
          </p>
        </div>
      </div>

      {/* 7-day activity chart */}
      <section className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">
          Estatísticas de utilização (últimos 7 dias)
        </h2>
        <div className="grid grid-cols-7 gap-3 items-end h-40 pt-4">
          {stats.dailySeries.map((point) => {
            const pct = Math.max(6, Math.round((point.count / maxDaily) * 100));
            return (
              <div key={point.date} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono tabular-nums text-[#A0AAB5]">
                  {point.count}
                </span>
                <div className="w-full max-w-[36px] rounded-t-md bg-[#0B0F14] border border-white/10 overflow-hidden flex items-end h-24">
                  <div
                    className="w-full bg-[#00D084] transition-all"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono tabular-nums text-[#A0AAB5]">
                  {point.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular & Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Conteúdos mais populares
          </h2>
          {stats.popularDownloads.length === 0 ? (
            <p className="text-sm text-[#A0AAB5]">Nenhum download publicado ainda.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {stats.popularDownloads.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      href={`/download/${item.slug}`}
                      className="font-medium text-white hover:text-[#00D084] truncate block"
                    >
                      {item.title}
                    </Link>
                    <span className="text-xs text-[#A0AAB5]">
                      {item.category?.name || 'Sem categoria'}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-xs text-[#00D084] shrink-0">
                    {Number(item.download_count).toLocaleString('pt-PT')} dl
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Últimos conteúdos adicionados
          </h2>
          {stats.recentDownloads.length === 0 ? (
            <p className="text-sm text-[#A0AAB5]">Nenhum download adicionado ainda.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {stats.recentDownloads.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      href={`/download/${item.slug}`}
                      className="font-medium text-white hover:text-[#00D084] truncate block"
                    >
                      {item.title}
                    </Link>
                    <span className="text-xs text-[#A0AAB5]">
                      Estado: {item.status} · {item.version ? `v${item.version}` : 'Sem versão'}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-xs text-[#A0AAB5] shrink-0">
                    {new Date(item.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
