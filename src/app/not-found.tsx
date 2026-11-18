import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#151B23] text-[#00D084]">
        <FileQuestion className="w-7 h-7" />
      </div>
      <h1 className="font-display text-3xl font-bold text-white">Página não encontrada (404)</h1>
      <p className="text-sm text-[#A0AAB5] leading-relaxed">
        O conteúdo ou endereço que procuras não existe ou foi movido.
      </p>
      <div className="pt-2 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao início</span>
        </Link>
        <Link
          href="/pesquisa"
          className="rounded-lg border border-white/10 bg-[#151B23] px-5 py-2.5 text-sm font-medium text-white hover:border-white/25"
        >
          Pesquisar
        </Link>
      </div>
    </div>
  );
}
