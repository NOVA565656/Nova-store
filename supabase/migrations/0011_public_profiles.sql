drop policy if exists "profiles: read public" on public.profiles;

create or replace view public.public_profiles as
  select id, display_name, name_type from public.profiles;

grant select on public.public_profiles to anon, authenticated;