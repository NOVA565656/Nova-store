create or replace function public.claim_pending_job()
returns setof public.jobs
language sql
as $$
  update public.jobs
  set status = 'processing', updated_at = now()
  where id = (
    select id
    from public.jobs
    where status = 'pending'
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning *;
$$;