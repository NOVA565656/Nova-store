-- (3) User B cannot update User A's listing (RLS silently updates 0 rows)
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

with r as (
  update listings set title = 'hacked'
  where id = '11111111-1111-1111-1111-111111111111'
  returning 1
)
select is((select count(*)::int from r), 0, 'user B cannot update user A listing (RLS blocks update)');

reset role;