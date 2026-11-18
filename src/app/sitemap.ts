import type { MetadataRoute } from 'next';
import { getCategoriesWithCounts, searchDownloads } from '@/lib/data';
import { getSiteUrl } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [categories, downloadsRes] = await Promise.all([
    getCategoriesWithCounts(),
    searchDownloads({ limit: 48, page: 1 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/downloads',
    '/sobre',
    '/contacto',
    '/privacidade',
    '/termos',
    '/copyright',
    '/reportar',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/categoria/${cat.slug}`,
    lastModified: new Date(cat.created_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const downloadRoutes: MetadataRoute.Sitemap = downloadsRes.items.map((item) => ({
    url: `${siteUrl}/download/${item.slug}`,
    lastModified: new Date(item.updated_at || item.created_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...downloadRoutes];
}
