import { supabaseAdmin } from '@/lib/db';

export async function enqueueJob(listingId: string, type: string) {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert({ listing_id: listingId, job_type: type })
    .select()
    .single();
  if (error) throw new Error(`Failed to enqueue job: ${error.message}`);
  return data;
}