export type UserRole = 'admin' | 'user';
export type DownloadStatus = 'draft' | 'published' | 'archived';
export type AdPosition = 'header_banner' | 'in_feed' | 'sidebar_desktop' | 'footer_banner';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string | null;
  active: boolean;
  created_at: string;
  download_count?: number;
}

export interface DownloadItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string | null;
  category?: Category | null;
  thumbnail_url: string | null;
  file_url: string | null;
  external_download_url: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: string | null;
  file_type: string | null;
  version: string | null;
  operating_system: string | null;
  developer: string | null;
  author: string | null;
  download_count: number;
  featured: boolean;
  popular: boolean;
  premium: boolean;
  status: DownloadStatus;
  instructions: string | null;
  requirements: string | null;
  tags: string[];
  screenshots: string[];
  security_notes: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface DownloadEvent {
  id: string;
  download_id: string;
  user_id: string | null;
  created_at: string;
  source: string;
  download?: Pick<DownloadItem, 'id' | 'title' | 'slug' | 'version'> | null;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  active: boolean;
  created_at: string;
  email?: string;
}

export interface SiteSettings {
  site_name: string;
  company_name: string;
  slogan: string;
  description: string;
  contact_email: string;
  logo_url: string;
  security_notice: string;
  ga_measurement_id: string;
  adsense_client_id: string;
  social_links: {
    github: string;
    instagram: string;
    youtube: string;
    facebook: string;
  };
}

export interface Advertisement {
  id: string;
  name: string;
  position: AdPosition;
  code: string | null;
  image_url: string | null;
  destination_url: string | null;
  active: boolean;
  created_at: string;
}

export interface ReportItem {
  id: string;
  download_id: string | null;
  reason: string;
  description: string;
  email: string;
  status: ReportStatus;
  created_at: string;
  download?: Pick<DownloadItem, 'id' | 'title' | 'slug'> | null;
}

export interface DashboardStats {
  totalDownloads: number;
  totalCategories: number;
  totalDownloadEvents: number;
  todayDownloads: number;
  last7DaysDownloads: number;
  pendingReports: number;
  popularDownloads: DownloadItem[];
  recentDownloads: DownloadItem[];
  dailySeries: { date: string; count: number }[];
}

export interface SearchFilters {
  q?: string;
  category?: string;
  os?: string;
  free?: boolean;
  sort?: 'recent' | 'popular' | 'name' | 'updated';
  page?: number;
  limit?: number;
}
