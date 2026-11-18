import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Cpu, FileText, HardDrive, Layers, User } from 'lucide-react';
import {
  getDownloadBySlug,
  getPublicSettings,
  getRelatedDownloads,
} from '@/lib/data';
import { getSiteUrl, isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DownloadActionPanel } from '@/components/DownloadActionPanel';
import { DownloadCard } from '@/components/DownloadCard';

export const dynamic = 'force-dynamic';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getDownloadBySlug(slug);
  if (!item) {
    return { title: 'Download não encontrado' };
  }

  const canonical = `${getSiteUrl()}/download/${item.slug}`;
  const description = item.short_description || item.description.slice(0, 155);

  return {
    title: item.version ? `${item.title} v${item.version}` : item.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${item.title} | LAZER DOWNLOADS`,
      description,
      url: canonical,
      type: 'article',
      ...(item.thumbnail_url ? { images: [{ url: item.thumbnail_url, alt: item.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description,
      ...(item.thumbnail_url ? { images: [item.thumbnail_url] } : {}),
    },
  };
}

export default async function DownloadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, settings] = await Promise.all([
    getDownloadBySlug(slug),
    getPublicSettings(),
  ]);

  if (!item) {
    notFound();
  }

  const related = await getRelatedDownloads(item.id, item.category_id, 3);

  let isAuthenticated = false;
  let isFavorited = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          isAuthenticated = true;
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('download_id', item.id)
            .maybeSingle();
          isFavorited = Boolean(fav);
        }
      }
    } catch {
      // ignore
    }
  }

  const siteUrl = getSiteUrl();
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: item.title,
    description: item.short_description || item.description,
    applicationCategory: item.category?.name || 'UtilitiesApplication',
    operatingSystem: item.operating_system || 'All',
    softwareVersion: item.version || undefined,
    fileSize: item.file_size || undefined,
    datePublished: item.published_at || item.created_at,
    dateModified: item.updated_at,
    url: `${siteUrl}/download/${item.slug}`,
    author: item.developer || item.author ? { '@type': 'Organization', name: item.developer || item.author } : undefined,
    offers: {
      '@type': 'Offer',
      price: item.premium ? undefined : '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            ...(item.category
              ? [{ label: item.category.name, href: `/categoria/${item.category.slug}` }]
              : [{ label: 'Downloads', href: '/downloads' }]),
            { label: item.title },
          ]}
        />

        <Link
          href={item.category ? `/categoria/${item.category.slug}` : '/downloads'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A0AAB5] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-white/10 bg-[#151B23] overflow-hidden">
            <div className="aspect-[16/9] w-full bg-[#0B0F14] overflow-hidden">
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#151B23] to-[#0B0F14] p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#151B23] text-[#00D084]">
                    <CategoryIcon name={item.category?.icon} className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-[#A0AAB5]">{item.category?.name || 'LAZER DOWNLOADS'}</p>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#A0AAB5]">
                <span>{item.category?.name || 'Geral'}</span>
                {item.operating_system && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{item.operating_system}</span>
                  </>
                )}
                {item.version && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">v{item.version}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="text-[#00D084] font-medium">
                  {item.premium ? 'Premium' : 'Gratuito'}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-bold text-white">
                {item.title}
              </h1>

              {item.short_description && (
                <p className="text-base text-[#A0AAB5] leading-relaxed">
                  {item.short_description}
                </p>
              )}
            </div>
          </div>

          {/* Technical Spec Grid */}
          <section aria-labelledby="specs-heading" className="rounded-xl border border-white/10 bg-[#151B23] p-6">
            <h2 id="specs-heading" className="font-display text-lg font-semibold text-white mb-4">
              Ficha técnica
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-3.5">
                <dt className="flex items-center gap-1.5 text-xs text-[#A0AAB5] mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#00D084]" />
                  Versão
                </dt>
                <dd className="font-mono tabular-nums text-white">{item.version || '—'}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-3.5">
                <dt className="flex items-center gap-1.5 text-xs text-[#A0AAB5] mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-[#00D084]" />
                  Tamanho
                </dt>
                <dd className="font-mono tabular-nums text-white">{item.file_size || '—'}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-3.5">
                <dt className="flex items-center gap-1.5 text-xs text-[#A0AAB5] mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#00D084]" />
                  Formato
                </dt>
                <dd className="font-mono text-white">{item.file_type || '—'}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-3.5">
                <dt className="flex items-center gap-1.5 text-xs text-[#A0AAB5] mb-1">
                  <Cpu className="w-3.5 h-3.5 text-[#00D084]" />
                  Sistema compatível
                </dt>
                <dd className="text-white">{item.operating_system || 'Multiplataforma'}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-3.5">
                <dt className="flex items-center gap-1.5 text-xs text-[#A0AAB5] mb-1">
                  <User className="w-3.5 h-3.5 text-[#00D084]" />
                  Desenvolvedor / Autor
                </dt>
                <dd className="text-white truncate">{item.developer || item.author || '—'}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-3.5">
                <dt className="flex items-center gap-1.5 text-xs text-[#A0AAB5] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#00D084]" />
                  Última atualização
                </dt>
                <dd className="text-white">{formatDate(item.updated_at)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-[#A0AAB5]">
              Publicado originalmente em: <span className="text-white">{formatDate(item.published_at || item.created_at)}</span>
            </p>
          </section>

          {/* Description */}
          <section className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">Descrição completa</h2>
            <div className="text-sm sm:text-base text-[#A0AAB5] leading-relaxed whitespace-pre-line">
              {item.description}
            </div>
          </section>

          {/* Requirements & Instructions */}
          {(item.requirements || item.instructions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {item.requirements && (
                <section className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-3">
                  <h2 className="font-display text-lg font-semibold text-white">Requisitos</h2>
                  <p className="text-sm text-[#A0AAB5] leading-relaxed whitespace-pre-line">
                    {item.requirements}
                  </p>
                </section>
              )}
              {item.instructions && (
                <section className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-3">
                  <h2 className="font-display text-lg font-semibold text-white">
                    Instruções de instalação
                  </h2>
                  <p className="text-sm text-[#A0AAB5] leading-relaxed whitespace-pre-line">
                    {item.instructions}
                  </p>
                </section>
              )}
            </div>
          )}

          {/* Screenshots */}
          {item.screenshots && item.screenshots.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-lg font-semibold text-white">Capturas de ecrã</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.screenshots.map((shot, idx) => (
                  <div
                    key={`${shot}-${idx}`}
                    className="overflow-hidden rounded-xl border border-white/10 bg-[#151B23] aspect-video"
                  >
                    <img
                      src={shot}
                      alt={`${item.title} captura ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-[#151B23] p-5 flex flex-wrap items-center gap-2 text-xs text-[#A0AAB5]">
              <span className="font-semibold text-white mr-1">Etiquetas:</span>
              {item.tags.map((tag, idx) => (
                <React.Fragment key={tag}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <Link
                    href={`/pesquisa?q=${encodeURIComponent(tag)}`}
                    className="hover:text-[#00D084] transition-colors"
                  >
                    {tag}
                  </Link>
                </React.Fragment>
              ))}
            </section>
          )}
        </div>

        {/* Right Sticky Download CTA Column */}
        <aside className="lg:sticky lg:top-24">
          <DownloadActionPanel
            downloadId={item.id}
            slug={item.slug}
            title={item.title}
            initialCount={Number(item.download_count || 0)}
            initialFavorited={isFavorited}
            isAuthenticated={isAuthenticated}
            fileSize={item.file_size}
            fileType={item.file_type}
            version={item.version}
            securityNotice={item.security_notes || settings.security_notice}
          />
        </aside>
      </div>

      {/* Related Downloads */}
      {related.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-white/10">
          <h2 className="font-display text-2xl font-bold text-white">Conteúdos relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <DownloadCard key={rel.id} item={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
