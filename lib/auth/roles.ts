import { supabaseAdmin } from '@/lib/db';

export async function getUserRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('roles')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return [];
  return (data.roles as string[]) ?? [];
}