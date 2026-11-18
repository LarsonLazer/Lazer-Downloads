'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBarHero({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/pesquisa?q=${encodeURIComponent(trimmed)}` : '/pesquisa');
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Pesquisar ficheiros e aplicações"
      className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-white/15 bg-[#151B23] p-2 shadow-lg focus-within:border-[#00D084]/60 transition-colors"
    >
      <div className="flex flex-1 items-center gap-3 px-3">
        <Search className="w-5 h-5 text-[#00D084] shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar aplicações, jogos, programas ou ficheiros..."
          className="w-full bg-transparent py-2.5 text-sm sm:text-base text-white placeholder-[#A0AAB5] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-[#00D084] px-6 py-3 text-sm font-bold tracking-wide text-[#0B0F14] hover:bg-[#00B874] transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
      >
        PESQUISAR
      </button>
    </form>
  );
}
