-- @security:rls
begin;
select plan(6);

insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.local'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.local');

select is(
  (select relrowsecurity from pg_class where relname = 'profiles'),
  true, 'RLS enabled on profiles'
);

set local role anon;
select is(
  (select count(*)::int from profiles), 0, 'anon reads 0 rows'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  0, 'user A cannot select user B profile'
);

with r as (
  update profiles set display_name = 'hacked'
  where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' returning 1
)
select is((select count(*)::int from r), 0, 'user A cannot update user B profile');

select throws_like(
  $$ update profiles set roles = array['buyer','seller']::text[]
     where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '%permission denied%',
  'authenticated cannot update roles column'
);

select throws_like(
  $$ insert into profiles (id, display_name)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hijack') $$,
  '%permission denied%',
  'authenticated cannot insert profiles directly (Rule 8)'
);

reset role;
select * from finish();
rollback;