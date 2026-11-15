-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('message', 'plan_ready', 'verification', 'listing_status')),
  content text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
create policy "notifications: read own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications: update own" on public.notifications for update using (auth.uid() = user_id);

-- Moderation
alter table public.messages add column if not exists is_flagged boolean not null default false;
alter table public.messages add column if not exists flag_reason text;

-- Admins can read all messages for moderation
create policy "messages: admin read all" on public.messages for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);