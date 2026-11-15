-- Add admin flag to profiles
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Feature Flags table (Global Defaults)
create table if not exists public.feature_flags (
  key text primary key,
  is_enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

-- Per-User Overrides
create table if not exists public.user_flags (
  user_id uuid not null references public.profiles(id) on delete cascade,
  flag_key text not null references public.feature_flags(key) on delete cascade,
  is_enabled boolean not null,
  primary key (user_id, flag_key)
);

-- Audit Logs
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.feature_flags enable row level security;
alter table public.user_flags enable row level security;
alter table public.admin_logs enable row level security;

-- Everyone can read flags, only service_role can modify (done via API)
create policy "feature_flags: read all" on public.feature_flags for select using (true);
create policy "user_flags: read own" on public.user_flags for select using (auth.uid() = user_id);

-- Insert default flags
insert into public.feature_flags (key, is_enabled, description) values
  ('messaging', true, 'Enable buyer-seller messaging'),
  ('ai_scanning', true, 'Enable AI policy scanning'),
  ('facebook_publish', false, 'Enable Facebook auto-publishing')
on conflict (key) do nothing;