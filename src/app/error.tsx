'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-[#151B23] text-rose-400">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h1 className="font-display text-3xl font-bold text-white">Ocorreu um erro inesperado</h1>
      <p className="text-sm text-[#A0AAB5] leading-relaxed">
        Não foi possível concluir o pedido neste momento. Tenta novamente ou regressa à página inicial.
      </p>
      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tentar novamente</span>
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/10 bg-[#151B23] px-5 py-2.5 text-sm font-medium text-white"
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
