import React from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Star } from 'lucide-react';
import type { DownloadItem } from '@/types/database';
import { CategoryIcon } from './CategoryIcon';

function formatShortDate(iso: string | null): string {
  if (!iso) return 'Recente';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Recente';
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function DownloadCard({ item }: { item: DownloadItem }) {
  const categoryName = item.category?.name || 'Geral';
  const dateLabel = formatShortDate(item.updated_at || item.published_at || item.created_at);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#151B23] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#00D084]/40">
      <Link href={`/download/${item.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-[#0B0F14]">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#151B23] to-[#0B0F14] p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#151B23] text-[#00D084]">
              <CategoryIcon name={item.category?.icon} className="w-6 h-6" />
            </div>
            <span className="text-xs text-[#A0AAB5] line-clamp-1">{categoryName}</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-[#A0AAB5] mb-2">
          <span className="truncate">{categoryName}</span>
          {item.operating_system && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{item.operating_system}</span>
            </>
          )}
          {item.premium && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#00D084] font-medium">Premium</span>
            </>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-white leading-snug mb-2">
          <Link
            href={`/download/${item.slug}`}
            className="hover:text-[#00D084] transition-colors line-clamp-1"
          >
            {item.title}
          </Link>
        </h3>

        <p className="text-sm text-[#A0AAB5] leading-relaxed line-clamp-2 mb-4 flex-1">
          {item.short_description || item.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono tabular-nums text-[#A0AAB5] pt-3 border-t border-white/10">
          {item.version && <span>v{item.version}</span>}
          {item.version && item.file_size && <span aria-hidden="true">·</span>}
          {item.file_size && <span>{item.file_size}</span>}
          {(item.version || item.file_size) && <span aria-hidden="true">·</span>}
          <span>{dateLabel}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-[#A0AAB5] font-mono tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#00D084]" />
              {Number(item.download_count || 0).toLocaleString('pt-PT')}
            </span>
            {item.rating !== null && item.rating !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {Number(item.rating).toFixed(1)}
              </span>
            )}
          </div>

          <Link
            href={`/download/${item.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00D084] px-3.5 py-2 text-xs font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Ver detalhes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
