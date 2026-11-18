import React from 'react';
import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como a LAZER DOWNLOADS recolhe, protege e trata os dados dos utilizadores.',
  alternates: { canonical: `${getSiteUrl()}/privacidade` },
};

export default async function PrivacyPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Política de Privacidade' },
          ]}
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-xs text-[#A0AAB5]">
          {settings.site_name} · {settings.company_name}
        </p>
      </div>

      <article className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 space-y-6 text-sm text-[#A0AAB5] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">1. Dados recolhidos</h2>
          <p>
            Apenas recolhemos os dados estritamente necessários ao funcionamento da plataforma: email e nome de perfil quando crias conta, registos agregados de downloads para estatísticas e informações submetidas voluntariamente nos formulários de contacto ou denúncia.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">2. Autenticação e segurança</h2>
          <p>
            As credenciais de autenticação são geridas de forma encriptada através do Supabase Auth. Nunca partilhamos ou vendemos dados pessoais a terceiros.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">3. Cookies e analítica</h2>
          <p>
            Utilizamos cookies essenciais de sessão e, quando configurado pelo administrador, métricas de audiência anónimas para melhorar o desempenho do catálogo.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">4. Contacto e eliminação de dados</h2>
          <p>
            Podes solicitar a atualização ou eliminação dos teus dados através do email{' '}
            <a href={`mailto:${settings.contact_email}`} className="text-[#00D084] hover:underline">
              {settings.contact_email}
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
