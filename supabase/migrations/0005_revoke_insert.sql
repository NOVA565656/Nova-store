-- Rule 8: profiles are created ONLY by the on_auth_user_created trigger.
-- Direct INSERT by authenticated users is completely revoked.
revoke insert on profiles from authenticated;

-- Drop the INSERT policy since the trigger handles this at the system level.
drop policy if exists "profiles: insert own" on profiles;