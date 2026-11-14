import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { processListingWithAI } from '@/lib/ai';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Atomic claim: locks the row and updates status in one step
  const { data: claimedJobs, error: claimError } = await supabaseAdmin.rpc('claim_pending_job');

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  if (!claimedJobs || claimedJobs.length === 0) {
    return NextResponse.json({ message: 'No pending jobs' });
  }

  const job = claimedJobs[0];

  // 2. Fetch the associated listing
  const { data: listing, error: listingError } = await supabaseAdmin
    .from('listings')
    .select('*')
    .eq('id', job.listing_id)
    .single();

  if (listingError || !listing) {
    await supabaseAdmin.from('jobs').update({ status: 'failed', result: { error: 'Listing not found' } }).eq('id', job.id);
    return NextResponse.json({ error: 'Listing missing' }, { status: 500 });
  }

  try {
    const aiResult = await processListingWithAI(listing.title, listing.description || '');

    if (!aiResult.pass) {
      await supabaseAdmin.from('listings').update({ status: 'archived' }).eq('id', listing.id);
      await supabaseAdmin.from('jobs').update({ status: 'failed', result: aiResult }).eq('id', job.id);
    } else {
      await supabaseAdmin.from('listings').update({ status: 'plan_ready', ai_plan: aiResult.plan }).eq('id', listing.id);
      await supabaseAdmin.from('jobs').update({ status: 'completed', result: aiResult }).eq('id', job.id);
    }

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await supabaseAdmin.from('jobs').update({ status: 'failed', result: { error: message } }).eq('id', job.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}