-- Rule 8 addition: profiles are created ONLY by the auth.users trigger.
-- Direct INSERT by authenticated is revoked.
-- updated_at is no longer user-writable; auto-set by trigger.
revoke update on profiles from authenticated;
grant update (display_name, name_type) on profiles to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on profiles;
create trigger set_updated_at
  before update on profiles
  for each row execute function public.set_updated_at();