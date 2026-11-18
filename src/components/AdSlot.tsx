import React from 'react';
import type { Advertisement } from '@/types/database';
import { sanitizeUrl } from '@/lib/format';

export function AdSlot({
  ads,
  adsenseClientId,
  className = '',
}: {
  ads: Advertisement[];
  adsenseClientId?: string;
  className?: string;
}) {
  const activeAd = ads.find((ad) => ad.active);
  if (!activeAd) {
    return null;
  }

  const destinationUrl = sanitizeUrl(activeAd.destination_url);
  const imageUrl = sanitizeUrl(activeAd.image_url);

  if (imageUrl) {
    const content = (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151B23]">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 text-[11px] text-[#A0AAB5]">
          <span>Publicidade</span>
          <span>{activeAd.name}</span>
        </div>
        <img
          src={imageUrl}
          alt={activeAd.name}
          referrerPolicy="no-referrer"
          className="w-full max-h-36 object-cover"
        />
      </div>
    );

    return (
      <aside aria-label="Espaço publicitário" className={className}>
        {destinationUrl ? (
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block hover:opacity-95 transition-opacity"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </aside>
    );
  }

  if (activeAd.code && adsenseClientId && /^ca-pub-\d{10,20}$/.test(adsenseClientId)) {
    const slotMatch = activeAd.code.match(/\d{6,16}/);
    if (!slotMatch) return null;

    return (
      <aside
        aria-label="Espaço publicitário"
        className={`rounded-xl border border-white/10 bg-[#151B23] p-4 ${className}`}
      >
        <p className="text-[11px] text-[#A0AAB5] mb-2">Publicidade</p>
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={adsenseClientId}
          data-ad-slot={slotMatch[0]}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </aside>
    );
  }

  return null;
}
