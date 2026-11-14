import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { processListingWithAI } from '@/lib/ai';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ATOMIC LOCK: Update and select in one go to prevent duplicate processing
  const { data: jobs, error: jobError } = await supabaseAdmin
    .from('jobs')
    .update({ status: 'processing' })
    .eq('status', 'pending')
    .select('*, listings(*)')
    .limit(1);

  if (jobError || !jobs || jobs.length === 0) {
    return NextResponse.json({ message: 'No pending jobs or error' });
  }

  const job = jobs[0];
  const listing = Array.isArray(job.listings) ? job.listings[0] : job.listings;
  
  if (!listing) {
    await supabaseAdmin.from('jobs').update({ status: 'failed', result: { error: 'Listing missing' } }).eq('id', job.id);
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
  } catch (err: any) {
    await supabaseAdmin.from('jobs').update({ status: 'failed', result: { error: err.message } }).eq('id', job.id);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}