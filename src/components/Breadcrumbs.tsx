import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getSiteUrl } from '@/lib/supabase/config';

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-[#A0AAB5]">
        {items.map((item, idx) => (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#A0AAB5]/60 shrink-0" />}
            {item.href && idx < items.length - 1 ? (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white font-medium truncate max-w-[260px]">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}
