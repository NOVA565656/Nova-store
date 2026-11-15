-- Re-verify events table exists from P4
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'click', 'cart', 'message_intent')),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Anyone can insert an event (tracking), but no one can read them directly via RLS.
drop policy if exists "events: insert anyone" on public.events;
create policy "events: insert anyone" on public.events for insert with check (true);