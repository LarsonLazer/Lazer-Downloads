import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { AnalyticsScript } from '@/components/AnalyticsScript';
import { getPublicSettings } from '@/lib/data';
import { getSiteUrl, isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-outfit',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteUrl = getSiteUrl();

  const title = `${settings.site_name} — ${settings.slogan}`;
  const description = settings.description;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${settings.site_name}`,
    },
    description,
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    openGraph: {
      type: 'website',
      locale: 'pt_PT',
      siteName: settings.site_name,
      title,
      description,
      url: siteUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();
  const siteUrl = getSiteUrl();

  let userEmail: string | null = null;
  let isAdmin = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userEmail = user.email ?? null;
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, active')
            .eq('id', user.id)
            .maybeSingle();
          isAdmin = Boolean(profile && profile.role === 'admin' && profile.active);
        }
      }
    } catch {
      // Safe fallback if Supabase session read fails
    }
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.site_name,
    url: siteUrl,
    description: settings.description,
    publisher: {
      '@type': 'Organization',
      name: settings.company_name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/pesquisa?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html
      lang="pt"
      className={`${outfit.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#0B0F14] text-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AnalyticsScript
          gaMeasurementId={settings.ga_measurement_id}
          adsenseClientId={settings.adsense_client_id}
        />
        <ToastProvider>
          <SiteHeader userEmail={userEmail} isAdmin={isAdmin} />
          <main className="flex-1">{children}</main>
          <SiteFooter settings={settings} />
        </ToastProvider>
      </body>
    </html>
  );
}
