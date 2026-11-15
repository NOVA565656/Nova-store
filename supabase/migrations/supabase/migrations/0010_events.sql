create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'click', 'cart', 'message_intent')),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Anyone can insert an event (tracking), but no one can read them directly via RLS.
create policy "events: insert anyone" on public.events for insert with check (true);

-- We also need a public policy on listings so anon users can read published items
create policy "listings: read published" on public.listings for select using (status = 'published');
create policy "profiles: read public" on public.profiles for select using (true);