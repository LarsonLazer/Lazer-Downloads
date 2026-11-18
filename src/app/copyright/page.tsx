import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicSettings } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Direitos de Autor e Remoção',
  description: 'Política de direitos de autor, licenças permitidas e procedimento de remoção na LAZER DOWNLOADS.',
  alternates: { canonical: `${getSiteUrl()}/copyright` },
};

export default async function CopyrightPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Direitos de Autor' },
          ]}
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Direitos de Autor e Responsabilidade
        </h1>
      </div>

      <article className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 space-y-6 text-sm text-[#A0AAB5] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">Conteúdos permitidos</h2>
          <p>
            A plataforma {settings.site_name} permite exclusivamente a publicação de software disponibilizado legalmente, aplicações submetidas pelos seus desenvolvedores, ficheiros de distribuição livre, conteúdos de domínio público, conteúdos autorizados pelos proprietários, links oficiais e produções próprias da {settings.company_name}.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">Proibição de pirataria e malware</h2>
          <p>
            Não disponibilizamos nem toleramos software pirateado, cracks, ficheiros ilegais, malware ou conteúdos sem autorização dos titulares de direitos.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">Pedido de remoção (DMCA)</h2>
          <p>
            Caso identifiques qualquer conteúdo que viole direitos de autor ou represente risco de segurança, envia uma reclamação através da página{' '}
            <Link href="/reportar" className="text-[#00D084] hover:underline">
              Reportar Ficheiro
            </Link>{' '}
            ou para{' '}
            <a href={`mailto:${settings.contact_email}`} className="text-[#00D084] hover:underline">
              {settings.contact_email}
            </a>
            . Reclamações válidas resultam na remoção imediata do conteúdo.
          </p>
        </section>
      </article>
    </div>
  );
}
