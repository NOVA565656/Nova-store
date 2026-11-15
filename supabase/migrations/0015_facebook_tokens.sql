create table if not exists public.fb_pages (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  page_id text not null,
  page_name text not null,
  encrypted_token text not null,
  created_at timestamptz not null default now(),
  unique(seller_id, page_id)
);

alter table public.fb_pages enable row level security;
-- Only service_role can read tokens, but sellers can see their connected pages
create policy "fb_pages: read own" on public.fb_pages for select using (auth.uid() = seller_id);