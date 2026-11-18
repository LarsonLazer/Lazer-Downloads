import React from 'react';
import type { Metadata } from 'next';
import { Mail, Building2 } from 'lucide-react';
import { getPublicSettings } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ContactForm } from '@/components/ContactForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Entra em contacto com a equipa da LAZER DOWNLOADS / LAZER EMPRESAS.',
  alternates: { canonical: `${getSiteUrl()}/contacto` },
};

export default async function ContactPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Início', href: '/' },
            { label: 'Contacto' },
          ]}
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">Contacto</h1>
        <p className="mt-2 text-sm sm:text-base text-[#A0AAB5]">
          Tens dúvidas, queres propor a distribuição oficial de uma aplicação ou solicitar suporte? Fala connosco.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#151B23] p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Building2 className="w-4 h-4 text-[#00D084]" />
              <span>Entidade responsável</span>
            </div>
            <p className="text-sm text-[#A0AAB5]">{settings.company_name}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#151B23] p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Mail className="w-4 h-4 text-[#00D084]" />
              <span>Email oficial</span>
            </div>
            <a
              href={`mailto:${settings.contact_email}`}
              className="text-sm text-[#00D084] hover:underline break-all"
            >
              {settings.contact_email}
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
