-- @security:rls
begin;
select plan(3);

insert into auth.users (id, email, instance_id, aud, role, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

insert into listings (id, seller_id, type, title) 
values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'product', 'User A Item');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from listings where id = '11111111-1111-1111-1111-111111111111'),
  0, 'user B cannot read user A listing'
);

reset role;
set local role anon;

select is(
  (select count(*)::int from listings),
  0, 'anon cannot read listings'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_like(
  $$ update listings set title = 'hacked' where id = '11111111-1111-1111-1111-111111111111' $$,
  '%permission denied%',
  'authenticated cannot update listings without RLS policy (placeholder check)'
);

reset role;
select * from finish();
rollback;