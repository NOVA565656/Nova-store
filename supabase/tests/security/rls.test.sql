-- @security:rls
begin;
select plan(2);

-- 1. RLS must be enabled on the placeholder
select is(
  (select relrowsecurity from pg_class where relname = '_placeholder'),
  true,
  'RLS is enabled on _placeholder'
);

-- 2. Anon must read 0 rows (no policies => default deny)
set local role anon;
select is(
  (select count(*)::int from _placeholder),
  0,
  'anon reads 0 rows from _placeholder'
);
reset role;

select * from finish();
rollback;