import React from 'react';
import Link from 'next/link';
import type { SiteSettings } from '@/types/database';
import { BrandLogo } from './BrandLogo';

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#0B0F14] mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <BrandLogo variant="dark" />
            </Link>
            <p className="text-sm text-[#A0AAB5] leading-relaxed">
              {settings.slogan}
            </p>
            <p className="text-xs text-[#A0AAB5]/80 leading-relaxed">
              {settings.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Explorar</h3>
            <ul className="space-y-2.5 text-sm text-[#A0AAB5]">
              <li>
                <Link href="/downloads" className="hover:text-[#00D084] transition-colors">
                  Todos os Downloads
                </Link>
              </li>
              <li>
                <Link href="/categoria/aplicacoes-android" className="hover:text-[#00D084] transition-colors">
                  Aplicações Android
                </Link>
              </li>
              <li>
                <Link href="/categoria/programas-windows" className="hover:text-[#00D084] transition-colors">
                  Programas para Windows
                </Link>
              </li>
              <li>
                <Link href="/categoria/jogos" className="hover:text-[#00D084] transition-colors">
                  Jogos
                </Link>
              </li>
              <li>
                <Link href="/categoria/inteligencia-artificial" className="hover:text-[#00D084] transition-colors">
                  Inteligência Artificial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Plataforma</h3>
            <ul className="space-y-2.5 text-sm text-[#A0AAB5]">
              <li>
                <Link href="/pesquisa" className="hover:text-[#00D084] transition-colors">
                  Pesquisar Ficheiros
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-[#00D084] transition-colors">
                  Sobre a Lazer Downloads
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-[#00D084] transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/reportar" className="hover:text-[#00D084] transition-colors">
                  Reportar Ficheiro
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#00D084] transition-colors">
                  Área de Conta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal e Segurança</h3>
            <ul className="space-y-2.5 text-sm text-[#A0AAB5]">
              <li>
                <Link href="/privacidade" className="hover:text-[#00D084] transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-[#00D084] transition-colors">
                  Termos de Utilização
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-[#00D084] transition-colors">
                  Direitos de Autor e DMCA
                </Link>
              </li>
            </ul>
            {settings.contact_email && (
              <p className="mt-4 text-xs text-[#A0AAB5]">
                Contacto oficial:{' '}
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-white hover:text-[#00D084] transition-colors"
                >
                  {settings.contact_email}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#A0AAB5]">
          <p>
            © {year} {settings.site_name} · {settings.company_name}. Todos os direitos reservados.
          </p>
          <p>
            Distribuição segura para Angola, Brasil, Portugal e comunidade lusófona.
          </p>
        </div>
      </div>
    </footer>
  );
}
