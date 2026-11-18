import { createServerSupabaseClient } from './supabase/server';
import { isSupabaseConfigured } from './supabase/config';
import {
  CATEGORY_ALIAS_SLUGS,
  DEFAULT_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
} from './constants';
import type {
  Advertisement,
  AdPosition,
  Category,
  DashboardStats,
  DownloadItem,
  SearchFilters,
  SiteSettings,
} from '@/types/database';

export async function getPublicSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return DEFAULT_SITE_SETTINGS;

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_SITE_SETTINGS;
    }

    const val = data.value as Partial<SiteSettings>;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...val,
      social_links: {
        ...DEFAULT_SITE_SETTINGS.social_links,
        ...(val.social_links || {}),
      },
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getCategoriesWithCounts(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_CATEGORIES;
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return DEFAULT_CATEGORIES;

    const [{ data: categories, error: catError }, { data: downloads }] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true }),
      supabase.from('downloads').select('category_id').eq('status', 'published'),
    ]);

    if (catError || !categories || categories.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    const counts = new Map<string, number>();
    for (const item of downloads || []) {
      if (item.category_id) {
        counts.set(item.category_id, (counts.get(item.category_id) || 0) + 1);
      }
    }

    return categories.map((cat) => ({
      ...(cat as Category),
      download_count: counts.get(cat.id) || 0,
    }));
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function getCategoryBySlug(rawSlug: string): Promise<Category | null> {
  const slug = CATEGORY_ALIAS_SLUGS[rawSlug] || rawSlug;
  const categories = await getCategoriesWithCounts();
  return categories.find((c) => c.slug === slug) || null;
}

export async function getFeaturedDownloads(limit = 6): Promise<DownloadItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('downloads')
      .select('*, category:categories(*)')
      .eq('status', 'published')
      .eq('featured', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error || !data) return [];
    return data as DownloadItem[];
  } catch {
    return [];
  }
}

export async function getRecentDownloads(limit = 6): Promise<DownloadItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('downloads')
      .select('*, category:categories(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as DownloadItem[];
  } catch {
    return [];
  }
}

export async function getPopularDownloads(limit = 6): Promise<DownloadItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('downloads')
      .select('*, category:categories(*)')
      .eq('status', 'published')
      .order('download_count', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as DownloadItem[];
  } catch {
    return [];
  }
}

export async function getDownloadBySlug(slug: string): Promise<DownloadItem | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('downloads')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) return null;
    return data as DownloadItem;
  } catch {
    return null;
  }
}

export async function getRelatedDownloads(
  downloadId: string,
  categoryId: string | null,
  limit = 4
): Promise<DownloadItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    let query = supabase
      .from('downloads')
      .select('*, category:categories(*)')
      .eq('status', 'published')
      .neq('id', downloadId);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query
      .order('download_count', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as DownloadItem[];
  } catch {
    return [];
  }
}

export async function searchDownloads(filters: SearchFilters): Promise<{
  items: DownloadItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(48, Math.max(1, filters.limit || 12));

  if (!isSupabaseConfigured()) {
    return { items: [], total: 0, page, limit, totalPages: 0 };
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    let categoryId: string | null = null;
    if (filters.category) {
      const normalizedSlug = CATEGORY_ALIAS_SLUGS[filters.category] || filters.category;
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', normalizedSlug)
        .maybeSingle();
      if (!cat) {
        return { items: [], total: 0, page, limit, totalPages: 0 };
      }
      categoryId = cat.id;
    }

    let query = supabase
      .from('downloads')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('status', 'published');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (filters.os) {
      query = query.ilike('operating_system', `%${filters.os}%`);
    }

    if (filters.free) {
      query = query.eq('premium', false);
    }

    if (filters.q && filters.q.trim().length > 0) {
      const q = filters.q.trim().replace(/[%_,]/g, ' ');
      const tokens = q.split(/\s+/).filter(Boolean).slice(0, 4);
      const mainTerm = tokens[0] || q;
      query = query.or(
        `title.ilike.%${q}%,short_description.ilike.%${q}%,description.ilike.%${q}%,developer.ilike.%${q}%,author.ilike.%${q}%,file_type.ilike.%${q}%,title.ilike.%${mainTerm}%,tags.cs.{${mainTerm.toLowerCase()}}`
      );
    }

    switch (filters.sort) {
      case 'popular':
        query = query.order('download_count', { ascending: false });
        break;
      case 'name':
        query = query.order('title', { ascending: true });
        break;
      case 'updated':
        query = query.order('updated_at', { ascending: false });
        break;
      case 'recent':
      default:
        query = query
          .order('published_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });
        break;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to);

    if (error || !data) {
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const total = count ?? data.length;
    return {
      items: data as DownloadItem[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch {
    return { items: [], total: 0, page, limit, totalPages: 0 };
  }
}

export async function getActiveAds(position?: AdPosition): Promise<Advertisement[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    let query = supabase.from('advertisements').select('*').eq('active', true);
    if (position) {
      query = query.eq('position', position);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Advertisement[];
  } catch {
    return [];
  }
}

export async function getAdminStats(): Promise<DashboardStats> {
  const emptyStats: DashboardStats = {
    totalDownloads: 0,
    totalCategories: DEFAULT_CATEGORIES.length,
    totalDownloadEvents: 0,
    todayDownloads: 0,
    last7DaysDownloads: 0,
    pendingReports: 0,
    popularDownloads: [],
    recentDownloads: [],
    dailySeries: [],
  };

  if (!isSupabaseConfigured()) return emptyStats;

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return emptyStats;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      downloadsCountRes,
      categoriesCountRes,
      eventsTotalRes,
      eventsTodayRes,
      events7dRes,
      reportsPendingRes,
      popularRes,
      recentRes,
      seriesEventsRes,
    ] = await Promise.all([
      supabase.from('downloads').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('download_events').select('id', { count: 'exact', head: true }),
      supabase
        .from('download_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfToday),
      supabase
        .from('download_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('downloads')
        .select('*, category:categories(*)')
        .order('download_count', { ascending: false })
        .limit(5),
      supabase
        .from('downloads')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('download_events').select('created_at').gte('created_at', sevenDaysAgo),
    ]);

    const dayBuckets = new Map<string, number>();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayBuckets.set(key, 0);
    }

    for (const ev of seriesEventsRes.data || []) {
      const key = String(ev.created_at).slice(0, 10);
      if (dayBuckets.has(key)) {
        dayBuckets.set(key, (dayBuckets.get(key) || 0) + 1);
      }
    }

    return {
      totalDownloads: downloadsCountRes.count ?? 0,
      totalCategories: categoriesCountRes.count ?? 0,
      totalDownloadEvents: eventsTotalRes.count ?? 0,
      todayDownloads: eventsTodayRes.count ?? 0,
      last7DaysDownloads: events7dRes.count ?? 0,
      pendingReports: reportsPendingRes.count ?? 0,
      popularDownloads: (popularRes.data as DownloadItem[]) || [],
      recentDownloads: (recentRes.data as DownloadItem[]) || [],
      dailySeries: Array.from(dayBuckets.entries()).map(([date, count]) => ({ date, count })),
    };
  } catch {
    return emptyStats;
  }
}
