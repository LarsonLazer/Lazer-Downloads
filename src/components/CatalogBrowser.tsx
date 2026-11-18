'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { OPERATING_SYSTEMS } from '@/lib/constants';
import type { Category, DownloadItem } from '@/types/database';
import { DownloadCard } from './DownloadCard';
import { EmptyCatalogState } from './EmptyCatalogState';

interface CatalogBrowserProps {
  basePath: string;
  items: DownloadItem[];
  total: number;
  page: number;
  totalPages: number;
  categories?: Category[];
  lockedCategorySlug?: string;
  initialQuery?: string;
  initialCategory?: string;
  initialOs?: string;
  initialFree?: boolean;
  initialSort?: 'recent' | 'popular' | 'name' | 'updated';
}

export function CatalogBrowser({
  basePath,
  items,
  total,
  page,
  totalPages,
  categories = [],
  lockedCategorySlug,
  initialQuery = '',
  initialCategory = '',
  initialOs = '',
  initialFree = false,
  initialSort = 'recent',
}: CatalogBrowserProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(lockedCategorySlug || initialCategory);
  const [os, setOs] = useState(initialOs);
  const [free, setFree] = useState(initialFree);
  const [sort, setSort] = useState(initialSort);

  const navigateWithParams = (overrides?: {
    q?: string;
    category?: string;
    os?: string;
    free?: boolean;
    sort?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    const nextQ = overrides?.q !== undefined ? overrides.q : q;
    const nextCat = overrides?.category !== undefined ? overrides.category : category;
    const nextOs = overrides?.os !== undefined ? overrides.os : os;
    const nextFree = overrides?.free !== undefined ? overrides.free : free;
    const nextSort = overrides?.sort !== undefined ? overrides.sort : sort;
    const nextPage = overrides?.page !== undefined ? overrides.page : 1;

    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (!lockedCategorySlug && nextCat) params.set('categoria', nextCat);
    if (nextOs) params.set('os', nextOs);
    if (nextFree) params.set('gratuitos', 'true');
    if (nextSort && nextSort !== 'recent') params.set('ordem', nextSort);
    if (nextPage > 1) params.set('pagina', String(nextPage));

    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithParams({ page: 1 });
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-white/10 bg-[#151B23] p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A0AAB5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar por nome, desenvolvedor, tag ou formato..."
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#A0AAB5] focus:border-[#00D084] focus:outline-none min-h-[42px]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
          >
            Aplicar filtros
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A0AAB5]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00D084]" />
            Filtros:
          </span>

          {!lockedCategorySlug && categories.length > 0 && (
            <select
              aria-label="Filtrar por categoria"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                navigateWithParams({ category: e.target.value, page: 1 });
              }}
              className="rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white focus:border-[#00D084] focus:outline-none min-h-[38px]"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          <select
            aria-label="Filtrar por sistema operativo"
            value={os}
            onChange={(e) => {
              setOs(e.target.value);
              navigateWithParams({ os: e.target.value, page: 1 });
            }}
            className="rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white focus:border-[#00D084] focus:outline-none min-h-[38px]"
          >
            <option value="">Todos os sistemas</option>
            {OPERATING_SYSTEMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            aria-label="Ordenar por"
            value={sort}
            onChange={(e) => {
              const nextSort = e.target.value as 'recent' | 'popular' | 'name' | 'updated';
              setSort(nextSort);
              navigateWithParams({ sort: nextSort, page: 1 });
            }}
            className="rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white focus:border-[#00D084] focus:outline-none min-h-[38px]"
          >
            <option value="recent">Mais recentes</option>
            <option value="popular">Mais descarregados</option>
            <option value="updated">Atualizados recentemente</option>
            <option value="name">Nome (A-Z)</option>
          </select>

          <button
            type="button"
            onClick={() => {
              const nextFree = !free;
              setFree(nextFree);
              navigateWithParams({ free: nextFree, page: 1 });
            }}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors min-h-[38px] ${
              free
                ? 'border-[#00D084] bg-[#00D084]/15 text-[#00D084]'
                : 'border-white/10 bg-[#0B0F14] text-[#A0AAB5] hover:text-white'
            }`}
          >
            Apenas gratuitos
          </button>

          {(q || (!lockedCategorySlug && category) || os || free || sort !== 'recent') && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                if (!lockedCategorySlug) setCategory('');
                setOs('');
                setFree(false);
                setSort('recent');
                router.push(basePath);
              }}
              className="text-xs text-[#A0AAB5] hover:text-white underline ml-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between text-xs text-[#A0AAB5]">
        <p className="font-mono tabular-nums">
          {total === 0
            ? '0 resultados encontrados'
            : `${total.toLocaleString('pt-PT')} ${total === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}`}
        </p>
        {totalPages > 1 && (
          <p className="font-mono tabular-nums">
            Página {page} de {totalPages}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyCatalogState
          title={
            initialQuery
              ? `Sem resultados para "${initialQuery}"`
              : 'Nenhum ficheiro publicado nesta listagem'
          }
          description={
            initialQuery
              ? 'Tenta outro termo de pesquisa, remove filtros ativos ou explora as categorias disponíveis.'
              : 'Ainda não existem downloads publicados que correspondam a estes critérios. Novos conteúdos serão adicionados pela equipa editorial.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <DownloadCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => navigateWithParams({ page: page - 1 })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#151B23] px-3.5 py-2 text-xs font-medium text-white disabled:opacity-40 hover:border-white/25 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="px-3 text-xs font-mono tabular-nums text-[#A0AAB5]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => navigateWithParams({ page: page + 1 })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#151B23] px-3.5 py-2 text-xs font-medium text-white disabled:opacity-40 hover:border-white/25 transition-colors"
          >
            Seguinte
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
