-- Phase 0 scaffold: placeholder table to verify the RLS mechanism.
-- P1 replaces this with real `profiles`, `listings`, etc.
create extension if not exists pgcrypto;

create table if not exists _placeholder (
  id uuid primary key default gen_random_uuid(),
  name text
);

alter table _placeholder enable row level security;
-- Intentionally no policies: default-deny under RLS.

grant select on _placeholder to anon, authenticated;
grant insert, update, delete on _placeholder to authenticated;