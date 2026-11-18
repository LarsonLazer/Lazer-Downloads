'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Settings,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './ToastProvider';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Downloads', href: '/admin/downloads', icon: Package },
  { label: 'Categorias', href: '/admin/categorias', icon: FolderKanban },
  { label: 'Utilizadores', href: '/admin/utilizadores', icon: Users },
  { label: 'Publicidade', href: '/admin/publicidade', icon: Megaphone },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
];

export function AdminShell({
  adminEmail,
  children,
}: {
  adminEmail: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    showToast('Sessão de administrador terminada.', 'info');
    router.push('/');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#151B23] p-4 space-y-5 lg:sticky lg:top-24">
          <div className="px-2 pb-3 border-b border-white/10">
            <p className="text-xs font-semibold text-[#00D084]">Painel Administrativo</p>
            <p className="text-xs text-[#A0AAB5] truncate mt-0.5">{adminEmail || 'Administrador'}</p>
          </div>

          <nav aria-label="Navegação administrativa" className="flex flex-col gap-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#00D084] text-[#0B0F14] font-semibold'
                      : 'text-[#A0AAB5] hover:bg-[#0B0F14] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs font-medium text-[#A0AAB5] hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver website público</span>
            </Link>
            <button
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs font-medium text-[#A0AAB5] hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminar sessão</span>
            </button>
          </div>
        </aside>

        <div className="lg:col-span-9 min-w-0 space-y-8">{children}</div>
      </div>
    </div>
  );
}
