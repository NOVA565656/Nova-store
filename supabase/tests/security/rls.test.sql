-- @security:rls
begin;
select plan(3);

select is(
  (select relrowsecurity from pg_class where relname = 'profiles'),
  true,
  'RLS is enabled on profiles'
);

set local role anon;
select is(
  (select count(*)::int from profiles),
  0,
  'anon reads 0 rows from profiles (default-deny)'
);
reset role;

select is(
  (select relrowsecurity from pg_class where relname = '_placeholder'),
  true,
  'RLS still enabled on _placeholder'
);

select * from finish();
rollback;