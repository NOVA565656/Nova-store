create type listing_type as enum ('product', 'skill');
create type listing_status as enum ('draft', 'ai_scanning', 'plan_ready', 'approved', 'published', 'paused', 'archived');

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  type listing_type not null,
  status listing_status not null default 'draft',
  title text not null,
  description text,
  price numeric,
  images jsonb default '[]'::jsonb,
  proof_url text,
  ai_plan jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table listings enable row level security;

create policy "listings: read own" on listings for select using (auth.uid() = seller_id);
create policy "listings: insert own" on listings for insert with check (auth.uid() = seller_id);
create policy "listings: update own" on listings for update using (auth.uid() = seller_id);

create trigger set_updated_at before update on listings
  for each row execute function public.set_updated_at();

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  job_type text not null,
  status text not null default 'pending',
  payload jsonb default '{}'::jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);