import React from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export function EmptyCatalogState({
  title = 'Ainda não existem downloads publicados',
  description = 'Esta secção está preparada para receber aplicações, jogos, programas e documentos verificados. Novos conteúdos serão adicionados em breve.',
  actionHref = '/admin/downloads',
  actionLabel = 'Publicar no Painel Admin',
  showAdminAction = false,
}: {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  showAdminAction?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151B23] px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0B0F14] text-[#00D084]">
        <FolderOpen className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="mx-auto max-w-md text-sm text-[#A0AAB5] leading-relaxed">{description}</p>
      {showAdminAction && (
        <div className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center rounded-lg bg-[#00D084] px-4 py-2.5 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
