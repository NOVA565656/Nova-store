import { createClient } from '@supabase/supabase-js';

export function createUserClient(sessionToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}