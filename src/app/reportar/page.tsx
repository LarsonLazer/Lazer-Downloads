import React from 'react';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReportForm } from '@/components/ReportForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reportar Ficheiro',
  description: 'Reporta ficheiros com links inválidos, problemas de segurança ou violações de direitos de autor.',
  alternates: { canonical: `${getSiteUrl()}/reportar` },
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const downloadId = typeof sp.download_id === 'string' ? sp.download_id : null;
  const title = typeof sp.titulo === 'string' ? sp.titulo : null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Reportar Ficheiro' },
          ]}
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Reportar Ficheiro ou Conteúdo
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#A0AAB5]">
          Utiliza este formulário para denunciar links quebrados, ficheiros suspeitos ou solicitações de remoção por direitos de autor.
        </p>
      </div>

      <ReportForm downloadId={downloadId} downloadTitle={title} />
    </div>
  );
}
