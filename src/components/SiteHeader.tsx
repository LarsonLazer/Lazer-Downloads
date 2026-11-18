'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, ShieldCheck, User, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const HEADER_LINKS = [
  { label: 'Início', href: '/' },
  { label: 'Aplicações', href: '/categoria/aplicacoes-android' },
  { label: 'Jogos', href: '/categoria/jogos' },
  { label: 'Programas', href: '/categoria/programas-windows' },
  { label: 'Músicas', href: '/categoria/musica' },
  { label: 'Vídeos', href: '/categoria/videos' },
  { label: 'Documentos', href: '/categoria/livros-pdfs' },
  { label: 'Ferramentas', href: '/categoria/ferramentas' },
  { label: 'Contacto', href: '/contacto' },
];

interface SiteHeaderProps {
  userEmail?: string | null;
  isAdmin?: boolean;
}

export function SiteHeader({ userEmail, isAdmin }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(q ? `/pesquisa?q=${encodeURIComponent(q)}` : '/pesquisa');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0F14]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand */}
        <Link href="/" className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D084] rounded-lg">
          <BrandLogo variant="dark" />
        </Link>

        {/* Zone 2: Single-line navigation links */}
        <nav
          aria-label="Navegação principal"
          className="hidden xl:flex items-center gap-5 text-sm font-medium text-[#A0AAB5]"
        >
          {HEADER_LINKS.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                  active ? 'text-[#00D084]' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions (Search + Auth + Mobile Menu) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Pesquisar"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#151B23] px-3 py-2 text-sm text-[#A0AAB5] hover:text-white hover:border-white/20 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Pesquisar</span>
          </button>

          {isAdmin ? (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-3.5 py-2 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          ) : userEmail ? (
            <Link
              href="/conta"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#151B23] px-3.5 py-2 text-sm font-medium text-white hover:border-[#00D084]/50 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <User className="w-4 h-4 text-[#00D084]" />
              <span>Minha Conta</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#151B23] px-3.5 py-2 text-sm font-medium text-white hover:border-[#00D084]/50 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <User className="w-4 h-4 text-[#00D084]" />
              <span>Entrar</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            className="xl:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-[#151B23] p-2 text-white hover:border-white/20 min-h-[40px] min-w-[40px]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-white/10 bg-[#151B23]">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3"
          >
            <Search className="w-4 h-4 text-[#A0AAB5] shrink-0" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar aplicações, jogos, programas ou ficheiros..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-white placeholder-[#A0AAB5] focus:outline-none min-h-[40px]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#00D084] px-4 py-2 text-xs font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors whitespace-nowrap shrink-0"
            >
              Pesquisar
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-white/10 bg-[#0B0F14]">
          <nav
            aria-label="Menu mobile"
            className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1"
          >
            {HEADER_LINKS.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#151B23] text-[#00D084]'
                      : 'text-[#A0AAB5] hover:bg-[#151B23] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/downloads"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#A0AAB5] hover:bg-[#151B23] hover:text-white"
            >
              Todos os Downloads
            </Link>
            <div className="pt-3 mt-2 border-t border-white/10 flex items-center gap-3">
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg bg-[#00D084] px-4 py-2.5 text-sm font-semibold text-[#0B0F14]"
                >
                  Painel Admin
                </Link>
              ) : userEmail ? (
                <Link
                  href="/conta"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg border border-white/10 bg-[#151B23] px-4 py-2.5 text-sm font-medium text-white"
                >
                  Minha Conta
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg border border-white/10 bg-[#151B23] px-4 py-2.5 text-sm font-medium text-white"
                >
                  Entrar / Registar
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
