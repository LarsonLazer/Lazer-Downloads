import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Globe2, CheckCircle2 } from 'lucide-react';
import { getPublicSettings } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BrandLogo } from '@/components/BrandLogo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sobre o Projeto',
  description:
    'Conhece a LAZER DOWNLOADS da LAZER EMPRESAS: a plataforma moderna e segura de distribuição de software, jogos, documentos e ferramentas digitais.',
  alternates: { canonical: `${getSiteUrl()}/sobre` },
};

export default async function AboutPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Sobre' },
          ]}
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Sobre a {settings.site_name}
        </h1>
        <p className="mt-3 text-base text-[#A0AAB5] leading-relaxed">
          {settings.slogan} Um projeto desenvolvido pela <strong className="text-white">{settings.company_name}</strong> para ligar utilizadores de Angola, Brasil, Portugal e de todo o mundo a software e ficheiros digitais de confiança.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-3">
          <ShieldCheck className="w-6 h-6 text-[#00D084]" />
          <h2 className="font-display text-lg font-semibold text-white">Distribuição responsável</h2>
          <p className="text-sm text-[#A0AAB5] leading-relaxed">
            Apenas disponibilizamos software gratuito, livre, de domínio público, conteúdos próprios ou links oficiais autorizados pelos criadores.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-3">
          <Globe2 className="w-6 h-6 text-[#00D084]" />
          <h2 className="font-display text-lg font-semibold text-white">Foco lusófono e global</h2>
          <p className="text-sm text-[#A0AAB5] leading-relaxed">
            Estruturada para servir utilizadores em Angola, Brasil, Portugal e outros países com carregamento rápido e navegação intuitiva.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-3">
          <CheckCircle2 className="w-6 h-6 text-[#00D084]" />
          <h2 className="font-display text-lg font-semibold text-white">Transparência total</h2>
          <p className="text-sm text-[#A0AAB5] leading-relaxed">
            Cada ficha de download apresenta versão, tamanho, formato, requisitos, instruções e canal direto de denúncia em caso de irregularidade.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#151B23] p-8 space-y-6">
        <h2 className="font-display text-xl font-bold text-white">Identidade visual da marca</h2>
        <p className="text-sm text-[#A0AAB5]">
          Versões oficiais do logótipo para fundos escuros e fundos claros:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#0B0F14] p-6 flex items-center justify-center">
            <BrandLogo variant="dark" />
          </div>
          <div className="rounded-xl border border-white/10 bg-white p-6 flex items-center justify-center">
            <BrandLogo variant="light" />
          </div>
        </div>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/downloads"
            className="rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors"
          >
            Explorar downloads
          </Link>
          <Link
            href="/contacto"
            className="rounded-lg border border-white/10 bg-[#0B0F14] px-5 py-2.5 text-sm font-medium text-white hover:border-white/25 transition-colors"
          >
            Falar connosco
          </Link>
        </div>
      </section>
    </div>
  );
}
