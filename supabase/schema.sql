-- =============================================================================
-- LAZER DOWNLOADS (LAZER EMPRESAS) - Supabase PostgreSQL Schema, RLS & Storage
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- -----------------------------------------------------------------------------
-- 1. TABLES
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon text not null default 'Folder',
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  short_description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  thumbnail_url text,
  file_url text,
  external_download_url text,
  file_path text,
  file_name text,
  file_size text,
  file_type text,
  version text,
  operating_system text,
  developer text,
  author text,
  download_count bigint not null default 0 check (download_count >= 0),
  featured boolean not null default false,
  popular boolean not null default false,
  premium boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  instructions text,
  requirements text,
  tags text[] not null default '{}',
  screenshots text[] not null default '{}',
  security_notes text,
  rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  download_id uuid not null references public.downloads(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  source text not null default 'web'
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  download_id uuid not null references public.downloads(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, download_id)
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null check (position in ('header_banner', 'in_feed', 'sidebar_desktop', 'footer_banner')),
  code text,
  image_url text,
  destination_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  download_id uuid references public.downloads(id) on delete set null,
  reason text not null,
  description text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. INDEXES
-- -----------------------------------------------------------------------------

create index if not exists idx_categories_slug on public.categories (slug);
create index if not exists idx_categories_active on public.categories (active);

create index if not exists idx_downloads_slug on public.downloads (slug);
create index if not exists idx_downloads_category_id on public.downloads (category_id);
create index if not exists idx_downloads_status on public.downloads (status);
create index if not exists idx_downloads_featured on public.downloads (featured) where status = 'published';
create index if not exists idx_downloads_popular on public.downloads (download_count desc) where status = 'published';
create index if not exists idx_downloads_published_at on public.downloads (published_at desc) where status = 'published';
create index if not exists idx_downloads_tags on public.downloads using gin (tags);
create index if not exists idx_downloads_title_trgm on public.downloads using gin (title gin_trgm_ops);

create index if not exists idx_download_events_download_id on public.download_events (download_id);
create index if not exists idx_download_events_created_at on public.download_events (created_at desc);
create index if not exists idx_download_events_user_id on public.download_events (user_id);

create index if not exists idx_reports_status on public.reports (status);
create index if not exists idx_ads_position_active on public.advertisements (position, active);

-- -----------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_downloads_updated_at on public.downloads;
create trigger trg_downloads_updated_at
  before update on public.downloads
  for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role, active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    'user',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.record_download_and_increment(
  p_download_id uuid,
  p_user_id uuid default null,
  p_source text default 'web'
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_count bigint;
begin
  update public.downloads
  set download_count = download_count + 1
  where id = p_download_id
    and status = 'published'
  returning download_count into v_new_count;

  if v_new_count is null then
    raise exception 'Download not found or inactive';
  end if;

  insert into public.download_events (download_id, user_id, source)
  values (p_download_id, p_user_id, coalesce(nullif(p_source, ''), 'web'));

  return v_new_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.downloads enable row level security;
alter table public.download_events enable row level security;
alter table public.favorites enable row level security;
alter table public.site_settings enable row level security;
alter table public.advertisements enable row level security;
alter table public.reports enable row level security;
alter table public.contact_messages enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own display info"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and active = (select active from public.profiles where id = auth.uid())
  );

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Categories
create policy "Public can read active categories"
  on public.categories for select
  using (active = true or public.is_admin());

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Downloads
create policy "Public can read published downloads"
  on public.downloads for select
  using (status = 'published' or public.is_admin());

create policy "Admins can manage downloads"
  on public.downloads for all
  using (public.is_admin())
  with check (public.is_admin());

-- Download events (read own or admin; writes only via server/RPC)
create policy "Users can view own download events"
  on public.download_events for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage download events"
  on public.download_events for all
  using (public.is_admin())
  with check (public.is_admin());

-- Favorites
create policy "Users can manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Site settings
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Advertisements
create policy "Public can read active advertisements"
  on public.advertisements for select
  using (active = true or public.is_admin());

create policy "Admins can manage advertisements"
  on public.advertisements for all
  using (public.is_admin())
  with check (public.is_admin());

-- Reports
create policy "Anyone can submit a report"
  on public.reports for insert
  with check (true);

create policy "Admins can read and manage reports"
  on public.reports for select
  using (public.is_admin());

create policy "Admins can update reports"
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete reports"
  on public.reports for delete
  using (public.is_admin());

-- Contact messages
create policy "Anyone can submit contact message"
  on public.contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on public.contact_messages for select
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. SUPABASE STORAGE BUCKETS & POLICIES
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('downloads', 'downloads', false, 524288000),
  ('covers', 'covers', true, 10485760),
  ('screenshots', 'screenshots', true, 10485760),
  ('branding', 'branding', true, 5242880)
on conflict (id) do nothing;

create policy "Public read for covers, screenshots, branding"
  on storage.objects for select
  using (bucket_id in ('covers', 'screenshots', 'branding') or public.is_admin());

create policy "Admins can upload to storage buckets"
  on storage.objects for insert
  with check (
    bucket_id in ('downloads', 'covers', 'screenshots', 'branding')
    and public.is_admin()
  );

create policy "Admins can update storage objects"
  on storage.objects for update
  using (
    bucket_id in ('downloads', 'covers', 'screenshots', 'branding')
    and public.is_admin()
  );

create policy "Admins can delete storage objects"
  on storage.objects for delete
  using (
    bucket_id in ('downloads', 'covers', 'screenshots', 'branding')
    and public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- 6. INITIAL CATEGORIES & SITE SETTINGS (NO FAKE DOWNLOADS)
-- -----------------------------------------------------------------------------

insert into public.categories (name, slug, description, icon, active) values
  ('Aplicações Android', 'aplicacoes-android', 'Aplicações APK e utilitários verificados para smartphones e tablets Android.', 'Smartphone', true),
  ('Programas para Windows', 'programas-windows', 'Software essencial, produtividade, multimédia e utilitários para Windows.', 'Monitor', true),
  ('Jogos', 'jogos', 'Jogos gratuitos, demos oficiais e títulos independentes para PC e mobile.', 'Gamepad2', true),
  ('Música', 'musica', 'Faixas autorizadas, beats, áudio livre de direitos e packs de som.', 'Music', true),
  ('Vídeos', 'videos', 'Tutoriais, documentários, animações e conteúdos em vídeo autorizados.', 'Video', true),
  ('Livros e PDFs', 'livros-pdfs', 'E-books, manuais técnicos, apostilas e documentos em PDF de distribuição livre.', 'BookOpen', true),
  ('Inteligência Artificial', 'inteligencia-artificial', 'Ferramentas de IA, modelos locais, prompts e utilitários de automação.', 'Cpu', true),
  ('Ferramentas', 'ferramentas', 'Ferramentas técnicas, scripts, conversores e utilitários para criadores e devs.', 'Wrench', true),
  ('Wallpapers', 'wallpapers', 'Papéis de parede em alta resolução 4K e ultrawide para desktop e telemóvel.', 'Image', true),
  ('Drivers', 'drivers', 'Controladores oficiais e pacotes de atualização para hardware e periféricos.', 'HardDrive', true)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('general', '{
    "site_name": "LAZER DOWNLOADS",
    "company_name": "LAZER EMPRESAS",
    "slogan": "Tudo o que procuras, pronto para baixar!",
    "description": "Plataforma profissional de distribuição e descoberta de ficheiros digitais, aplicações, programas, jogos, músicas, vídeos, documentos e ferramentas.",
    "contact_email": "contacto@lazerempresas.com",
    "logo_url": "/logo-dark.svg",
    "security_notice": "Todos os ficheiros e links passam por verificação administrativa antes da publicação. Recomenda-se manter o antivírus ativo ao executar ficheiros externos.",
    "ga_measurement_id": "",
    "adsense_client_id": "",
    "social_links": {
      "github": "",
      "instagram": "",
      "youtube": "",
      "facebook": ""
    }
  }'::jsonb)
on conflict (key) do nothing;

-- =============================================================================
-- HOW TO PROMOTE YOUR FIRST ADMIN USER (run in Supabase SQL Editor after signup):
-- update public.profiles set role = 'admin' where id = '<YOUR_AUTH_USER_UUID>';
-- =============================================================================
