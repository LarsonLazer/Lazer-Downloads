import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, searchDownloads } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CategoryIcon } from '@/components/CategoryIcon';
import { CatalogBrowser } from '@/components/CatalogBrowser';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: 'Categoria não encontrada' };
  }

  const canonical = `${getSiteUrl()}/categoria/${category.slug}`;
  return {
    title: `${category.name} — Downloads`,
    description: category.description,
    alternates: { canonical },
    openGraph: {
      title: `${category.name} | LAZER DOWNLOADS`,
      description: category.description,
      url: canonical,
      type: 'website',
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const os = typeof sp.os === 'string' ? sp.os : '';
  const free = sp.gratuitos === 'true';
  const ordem =
    sp.ordem === 'popular' || sp.ordem === 'name' || sp.ordem === 'updated'
      ? sp.ordem
      : 'recent';
  const pagina = Math.max(1, Number(typeof sp.pagina === 'string' ? sp.pagina : 1) || 1);

  const result = await searchDownloads({
    q,
    category: category.slug,
    os,
    free,
    sort: ordem,
    page: pagina,
    limit: 12,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Downloads', href: '/downloads' },
            { label: category.name },
          ]}
        />

        <div className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-xl object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-[#0B0F14] text-[#00D084] shrink-0">
              <CategoryIcon name={category.icon} className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-white">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-[#A0AAB5] max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      <CatalogBrowser
        basePath={`/categoria/${category.slug}`}
        items={result.items}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        lockedCategorySlug={category.slug}
        initialQuery={q}
        initialOs={os}
        initialFree={free}
        initialSort={ordem}
      />
    </div>
  );
}
