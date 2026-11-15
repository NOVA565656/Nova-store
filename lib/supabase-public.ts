import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: ws as unknown as typeof WebSocket }
    }
  );
}