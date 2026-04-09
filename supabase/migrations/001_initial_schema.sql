-- =============================================
-- NL.studio Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. Products table
-- =============================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price integer not null check (price >= 100),
  image_url text,
  product_link text not null,
  category text not null default 'Digital',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- Public read for active products only
create policy "Public can view active products"
  on public.products for select
  using (active = true);

-- =============================================
-- 2. Orders table
-- =============================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_link text not null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  amount integer not null,
  carrier text not null check (carrier in ('mtn', 'orange')),
  status text not null default 'pending' check (status in ('pending', 'successful', 'failed')),
  fapshi_trans_id text,
  email_sent boolean not null default false,
  failure_email_sent boolean not null default false,
  poll_count integer not null default 0,
  last_polled_at timestamptz,
  client_ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS (no public access)
alter table public.orders enable row level security;

-- Index for payment status polling
create index if not exists idx_orders_fapshi_trans_id on public.orders(fapshi_trans_id);

-- Index for reconciliation cron
create index if not exists idx_orders_pending_status on public.orders(status, created_at)
  where status = 'pending';

-- =============================================
-- 3. Page content table (CMS key-value)
-- =============================================
create table if not exists public.page_content (
  id uuid primary key default uuid_generate_v4(),
  section text not null,
  key text not null,
  value text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(section, key)
);

-- Enable RLS
alter table public.page_content enable row level security;

-- Public read access
create policy "Public can view page content"
  on public.page_content for select
  using (true);

-- =============================================
-- 4. Activity log table
-- =============================================
create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  message text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error', 'critical')),
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Enable RLS (no public access)
alter table public.activity_log enable row level security;

-- Index for recent activity queries
create index if not exists idx_activity_log_created on public.activity_log(created_at desc);

-- =============================================
-- 5. Seed default page content (French)
-- =============================================
insert into public.page_content (section, key, value) values
  -- Hero
  ('hero', 'tagline', 'DESIGN & BRANDING STUDIO'),
  ('hero', 'title_line1', 'On cree des'),
  ('hero', 'title_line2', 'identites'),
  ('hero', 'title_line3', 'visuelles uniques'),
  ('hero', 'subtitle', 'Studio de design graphique specialise en branding, direction artistique et solutions visuelles sur mesure.'),
  ('hero', 'stat_projects', '50+'),
  ('hero', 'stat_years', '5+'),
  ('hero', 'stat_clients', '30+'),
  ('hero', 'stat_passion', '100%'),
  -- About
  ('about', 'label', 'A PROPOS'),
  ('about', 'title', 'Un regard creatif sur chaque projet'),
  ('about', 'paragraph1', 'NL.studio est un studio de design visuel fonde sur la conviction que chaque marque merite une identite forte et memorable.'),
  ('about', 'paragraph2', 'Notre approche combine rigueur strategique et sensibilite artistique pour livrer des resultats qui depassent les attentes.'),
  ('about', 'quote', '"Le design est la methode silencieuse de parler a votre audience."'),
  -- Contact
  ('contact', 'label', 'CONTACT'),
  ('contact', 'title', 'Discutons de votre projet'),
  ('contact', 'description', 'Pret a donner vie a votre vision ? Contactez-nous pour discuter de votre prochain projet.'),
  ('contact', 'email', 'hello@nlstudio.cm'),
  ('contact', 'phone', '+237 6XX XXX XXX'),
  ('contact', 'location', 'Douala, Cameroun'),
  -- Store
  ('store', 'title', 'Boutique'),
  ('store', 'subtitle', 'Ressources et templates premium pour vos projets creatifs.')
on conflict (section, key) do nothing;
