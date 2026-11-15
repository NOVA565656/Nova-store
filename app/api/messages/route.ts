import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { createUserClient } from '@/lib/supabase-client';
import { rateLimit } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import { z } from 'zod';

const messageSchema = z.object({
  listingId: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(`msg:${session.sub}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many messages' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value!;
  const supabase = createUserClient(rawToken);

  // 1. Verify listing exists and get seller_id
  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', parsed.data.listingId)
    .single();
    
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  if (listing.seller_id === session.sub) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });

  // 2. Upsert Thread
  const { data: thread } = await supabase
    .from('threads')
    .upsert(
      { listing_id: parsed.data.listingId, buyer_id: session.sub, seller_id: listing.seller_id },
      { onConflict: 'listing_id,buyer_id' }
    )
    .select('id')
    .single();

  if (!thread) return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });

  // 3. Insert Message
  const { error } = await supabase
    .from('messages')
    .insert({ thread_id: thread.id, sender_id: session.sub, content: parsed.data.content });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, threadId: thread.id });
}