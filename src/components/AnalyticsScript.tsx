import React from 'react';
import Script from 'next/script';

export function AnalyticsScript({
  gaMeasurementId,
  adsenseClientId,
}: {
  gaMeasurementId?: string;
  adsenseClientId?: string;
}) {
  const trimmedId = gaMeasurementId?.trim() || '';
  const validGtm = /^GTM-[A-Z0-9]+$/i.test(trimmedId) ? trimmedId : null;
  const validGa = /^G-[A-Z0-9]+$/i.test(trimmedId) ? trimmedId : null;

  const validAdsense =
    adsenseClientId && /^ca-pub-\d{10,20}$/.test(adsenseClientId.trim())
      ? adsenseClientId.trim()
      : null;

  return (
    <>
      {validGtm && (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtm.js?id=${validGtm}`}
            strategy="afterInteractive"
          />
          <Script id="lazer-gtm" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());`}
          </Script>
        </>
      )}
      {validGa && (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${validGa}`}
            strategy="afterInteractive"
          />
          <Script id="lazer-ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${validGa}');`}
          </Script>
        </>
      )}
      {validAdsense && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${validAdsense}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
