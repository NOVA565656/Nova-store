import { supabaseAdmin } from '@/lib/db';

export async function rateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  try {
    const windowSeconds = Math.ceil(windowMs / 1000);
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_key: key,
      p_limit: maxRequests,
      p_window_seconds: windowSeconds
    });

    if (error) throw error;
    return data as boolean;
  } catch (error) {
    // Fail-Closed: If rate limiting fails, block the request to prevent abuse.
    console.error('[RateLimit] Failed to check limit', error);
    return false; 
  }
}