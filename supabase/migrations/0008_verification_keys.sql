-- Add verification column to listings
alter table listings add column if not exists proof_verified boolean not null default false;

-- Keys table: We ONLY store the hash. Never the plaintext.
create table if not exists verification_keys (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  platform text not null,
  key_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table verification_keys enable row level security;

create policy "verification_keys: read own" on verification_keys 
  for select using (
    exists (
      select 1 from listings 
      where listings.id = verification_keys.listing_id 
      and listings.seller_id = auth.uid()
    )
  );