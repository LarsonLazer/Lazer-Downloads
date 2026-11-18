import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/supabase/config';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/downloads', '/categoria/', '/download/', '/sobre', '/contacto', '/privacidade', '/termos', '/copyright'],
        disallow: ['/admin', '/admin/', '/login', '/conta', '/api/', '/pesquisa?'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
