import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import {
  getActiveAds,
  getCategoriesWithCounts,
  getFeaturedDownloads,
  getPopularDownloads,
  getPublicSettings,
  getRecentDownloads,
} from '@/lib/data';
import { SearchBarHero } from '@/components/SearchBarHero';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DownloadCard } from '@/components/DownloadCard';
import { EmptyCatalogState } from '@/components/EmptyCatalogState';
import { AdSlot } from '@/components/AdSlot';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    settings,
    categories,
    featured,
    recent,
    popular,
    headerAds,
    inFeedAds,
    sidebarAds,
    footerAds,
  ] = await Promise.all([
    getPublicSettings(),
    getCategoriesWithCounts(),
    getFeaturedDownloads(6),
    getRecentDownloads(6),
    getPopularDownloads(6),
    getActiveAds('header_banner'),
    getActiveAds('in_feed'),
    getActiveAds('sidebar_desktop'),
    getActiveAds('footer_banner'),
  ]);

  const hasSidebarAd = sidebarAds.some((a) => a.active);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Configurable Header Ad Banner */}
      <AdSlot ads={headerAds} adsenseClientId={settings.adsense_client_id} />

      {/* Main Hero Banner */}
      <section className="rounded-2xl border border-white/10 bg-[#151B23] px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wider text-[#00D084] mb-3">
            {settings.site_name} · {settings.company_name}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
            Os melhores downloads num só lugar.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#A0AAB5] leading-relaxed">
            Descobre aplicações, jogos, programas, ferramentas e conteúdos digitais para descarregar gratuitamente ou aceder a conteúdos disponibilizados pelos seus criadores.
          </p>

          <SearchBarHero />

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A0AAB5]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00D084]" />
              Links oficiais e ficheiros verificados
            </span>
            <span>{settings.slogan}</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section aria-labelledby="categories-heading" className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="categories-heading" className="font-display text-2xl sm:text-3xl font-bold text-white">
              Categorias
            </h2>
            <p className="mt-1 text-sm text-[#A0AAB5]">
              Explora conteúdos organizados por área e sistema operativo.
            </p>
          </div>
          <Link
            href="/downloads"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00D084] hover:underline whitespace-nowrap shrink-0"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#151B23] p-5 transition-colors hover:border-[#00D084]/50 hover:bg-[#1B232E]"
            >
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#0B0F14] text-[#00D084] group-hover:border-[#00D084]/40">
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-white group-hover:text-[#00D084] transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-xs text-[#A0AAB5] leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-white/10 text-xs font-mono tabular-nums text-[#A0AAB5]">
                {(cat.download_count ?? 0).toLocaleString('pt-PT')}{' '}
                {(cat.download_count ?? 0) === 1 ? 'conteúdo' : 'conteúdos'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Downloads */}
      <section aria-labelledby="featured-heading" className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="featured-heading" className="font-display text-2xl sm:text-3xl font-bold text-white">
              Downloads em destaque
            </h2>
            <p className="mt-1 text-sm text-[#A0AAB5]">
              Seleção editorial em evidência na plataforma.
            </p>
          </div>
          <Link
            href="/downloads"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00D084] hover:underline whitespace-nowrap shrink-0"
          >
            <span>Explorar catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <EmptyCatalogState
            title="Ainda não existem destaques publicados"
            description="Quando os administradores publicarem e destacarem conteúdos na plataforma, estes serão exibidos aqui automaticamente."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((item) => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* In-feed Ad Banner */}
      <AdSlot ads={inFeedAds} adsenseClientId={settings.adsense_client_id} />

      {/* Latest & Most Downloaded with optional Desktop Sidebar Ad */}
      <div className={hasSidebarAd ? 'grid grid-cols-1 lg:grid-cols-4 gap-8 items-start' : 'space-y-16'}>
        <div className={hasSidebarAd ? 'lg:col-span-3 space-y-16' : 'space-y-16'}>
          {/* Latest Downloads */}
          <section aria-labelledby="recent-heading" className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="recent-heading" className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Últimos downloads
                </h2>
                <p className="mt-1 text-sm text-[#A0AAB5]">
                  Os ficheiros e aplicações mais recentes adicionados ao catálogo.
                </p>
              </div>
              <Link
                href="/downloads?ordem=recent"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00D084] hover:underline whitespace-nowrap shrink-0"
              >
                <span>Ver recentes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recent.length === 0 ? (
              <EmptyCatalogState
                title="Catálogo em preparação"
                description="Ainda não existem ficheiros publicados. Os conteúdos verificados serão adicionados em breve pela equipa LAZER DOWNLOADS."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recent.map((item) => (
                  <DownloadCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Most Downloaded */}
          <section aria-labelledby="popular-heading" className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="popular-heading" className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Mais descarregados
                </h2>
                <p className="mt-1 text-sm text-[#A0AAB5]">
                  Os conteúdos mais populares ordenados pelo número de downloads.
                </p>
              </div>
              <Link
                href="/downloads?ordem=popular"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00D084] hover:underline whitespace-nowrap shrink-0"
              >
                <span>Ver ranking</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {popular.length === 0 ? (
              <EmptyCatalogState
                title="Sem estatísticas de popularidade ainda"
                description="Os conteúdos mais descarregados aparecerão aqui assim que os primeiros ficheiros forem publicados e transferidos."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popular.map((item) => (
                  <DownloadCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>

        {hasSidebarAd && (
          <div className="hidden lg:block sticky top-24">
            <AdSlot ads={sidebarAds} adsenseClientId={settings.adsense_client_id} />
          </div>
        )}
      </div>

      {/* Footer Ad Banner */}
      <AdSlot ads={footerAds} adsenseClientId={settings.adsense_client_id} />
    </div>
  );
}
