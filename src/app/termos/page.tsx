import React from 'react';
import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Termos de Utilização',
  description: 'Termos e condições de acesso e descarga de ficheiros na LAZER DOWNLOADS.',
  alternates: { canonical: `${getSiteUrl()}/termos` },
};

export default async function TermsPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Termos de Utilização' },
          ]}
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Termos de Utilização
        </h1>
        <p className="mt-2 text-xs text-[#A0AAB5]">
          {settings.site_name} · {settings.company_name}
        </p>
      </div>

      <article className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 space-y-6 text-sm text-[#A0AAB5] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">1. Aceitação dos termos</h2>
          <p>
            Ao navegar ou descarregar ficheiros na plataforma {settings.site_name}, concordas com estes Termos de Utilização e com a nossa política de direitos de autor.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">2. Utilização permitida</h2>
          <p>
            Os ficheiros e links disponibilizados destinam-se exclusivamente a uso legal, educativo, profissional ou pessoal de acordo com a licença indicada pelo respetivo autor ou desenvolvedor.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">3. Integridade e segurança</h2>
          <p>
            É proibido tentar contornar limites de pedido, automatizar incrementos artificiais de downloads ou tentar aceder a rotas administrativas sem autorização.
          </p>
        </section>
      </article>
    </div>
  );
}
