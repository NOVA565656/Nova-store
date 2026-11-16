create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 0,
  reset_at timestamptz not null
);

-- Atomic rate limit function
create or replace function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean as $$
declare
  v_count int;
begin
  insert into public.rate_limits (key, count, reset_at)
  values (p_key, 1, now() + (p_window_seconds || ' seconds')::interval)
  on conflict (key) do update
  set count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < now() then now() + (p_window_seconds || ' seconds')::interval else rate_limits.reset_at end
  returning count into v_count;
  
  return v_count <= p_limit;
end;
$$ language plpgsql security definer;

-- SECURITY FIX: Lock down the function so only service_role can call it
revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;