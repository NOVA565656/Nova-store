create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(listing_id, buyer_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.threads enable row level security;
alter table public.messages enable row level security;

create policy "threads: read own" on public.threads for select 
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "threads: insert buyer" on public.threads for insert 
  with check (auth.uid() = buyer_id);

create policy "messages: read own" on public.messages for select 
  using (exists (
    select 1 from public.threads 
    where threads.id = messages.thread_id 
    and (threads.buyer_id = auth.uid() or threads.seller_id = auth.uid())
  ));

create policy "messages: insert own" on public.messages for insert 
  with check (
    auth.uid() = sender_id 
    and exists (
      select 1 from public.threads 
      where threads.id = thread_id 
      and (threads.buyer_id = auth.uid() or threads.seller_id = auth.uid())
    )
  );