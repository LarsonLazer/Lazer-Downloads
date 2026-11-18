import React from 'react';
import type { Metadata } from 'next';
import { getCategoriesWithCounts, searchDownloads } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CatalogBrowser } from '@/components/CatalogBrowser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Todos os Downloads',
  description:
    'Explora todos os ficheiros digitais, aplicações Android, programas para Windows, jogos, livros em PDF e ferramentas verificadas na LAZER DOWNLOADS.',
  alternates: {
    canonical: `${getSiteUrl()}/downloads`,
  },
};

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const categoria = typeof sp.categoria === 'string' ? sp.categoria : '';
  const os = typeof sp.os === 'string' ? sp.os : '';
  const free = sp.gratuitos === 'true';
  const ordem =
    sp.ordem === 'popular' || sp.ordem === 'name' || sp.ordem === 'updated'
      ? sp.ordem
      : 'recent';
  const pagina = Math.max(1, Number(typeof sp.pagina === 'string' ? sp.pagina : 1) || 1);

  const [categories, result] = await Promise.all([
    getCategoriesWithCounts(),
    searchDownloads({
      q,
      category: categoria,
      os,
      free,
      sort: ordem,
      page: pagina,
      limit: 12,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Todos os Downloads' },
          ]}
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Todos os Downloads
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#A0AAB5] max-w-2xl">
          Catálogo completo de aplicações, programas, jogos, músicas, vídeos, documentos e ferramentas disponíveis na plataforma.
        </p>
      </div>

      <CatalogBrowser
        basePath="/downloads"
        items={result.items}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        categories={categories}
        initialQuery={q}
        initialCategory={categoria}
        initialOs={os}
        initialFree={free}
        initialSort={ordem}
      />
    </div>
  );
}
