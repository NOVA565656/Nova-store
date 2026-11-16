# Production Launch Checklist

## 1. Environment Variables (Vercel)
Copy these into your Vercel Project Settings -> Environment Variables:

- `SESSION_SECRET` (Must be >= 32 chars)
- `ENCRYPTION_SECRET` (Must be >= 32 chars)
- `CRON_SECRET` (Random string for securing the cron job)
- `APP_URL` (e.g., https://yourdomain.com)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 2. Supabase Setup
1. Create a project on Supabase.
2. Run all migrations from `supabase/migrations/` in the SQL Editor.
3. Go to Project Settings -> API -> JWT Settings.
4. **CRITICAL:** Change the JWT Secret to match your `SESSION_SECRET`. This allows PostgREST to recognize your custom session tokens so RLS works.

## 3. Admin Bootstrapping
Because nobody is an admin by default, you must manually promote yourself after you sign up.
Run this in the Supabase SQL Editor:
```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'YOUR-USER-UUID-HERE';