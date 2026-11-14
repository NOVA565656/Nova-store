-- @security:rls
begin;
select plan(3);

-- Setup: Create users and a listing for User A
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.local'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.local');

insert into listings (id, seller_id, type, title) 
values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'product', 'User A Item');

-- (1) Anon cannot read listings
set local role anon;
select is(
  (select count(*)::int from listings),
  0, 
  'anon cannot read listings'
);
reset role;

-- (2) User B cannot read User A's listing
set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);

select is(
  (select count(*)::int from listings where id = '11111111-1111-1111-1111-111111111111'),
  0, 
  'user B cannot read user A listing'
);

-- (3) User B cannot update User A's listing (assert 0 rows affected)
with r as (
  update listings set title = 'hacked'
  where id = '11111111-1111-1111-1111-111111111111' returning 1
)
select is(
  (select count(*)::int from r), 
  0, 
  'user B cannot update user A listing'
);

reset role;
select * from finish();
rollback;