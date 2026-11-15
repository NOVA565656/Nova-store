import { supabaseAdmin } from '@/lib/db';

export async function isFeatureEnabled(flagKey: string, userId?: string): Promise<boolean> {
  try {
    // 1. Check Per-User Override first
    if (userId) {
      const { data: userFlag } = await supabaseAdmin
        .from('user_flags')
        .select('is_enabled')
        .eq('user_id', userId)
        .eq('flag_key', flagKey)
        .maybeSingle();

      if (userFlag) return userFlag.is_enabled;
    }

    // 2. Fallback to Global Default
    const { data: globalFlag } = await supabaseAdmin
      .from('feature_flags')
      .select('is_enabled')
      .eq('key', flagKey)
      .maybeSingle();

    return globalFlag?.is_enabled ?? false;
  } catch (error) {
    // 3. Fail-Closed: If DB is down or throws, disable the feature
    console.error(`[Flags] Failed to resolve flag ${flagKey}`, error);
    return false;
  }
}