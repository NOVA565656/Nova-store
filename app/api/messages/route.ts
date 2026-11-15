import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { createUserClient } from '@/lib/supabase-client';
import { supabaseAdmin } from '@/lib/db';
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

  // Await async rate limit
  const allowed = await rateLimit(`msg:${session.sub}`, 20, 60_000);
  if (!allowed) return NextResponse.json({ error: 'Too many messages' }, { status: 429 });

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const supabase = createUserClient(rawToken);

  const { data: listing } = await supabase.from('listings').select('seller_id, title').eq('id', parsed.data.listingId).single();
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  if (listing.seller_id === session.sub) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });

  const { data: existingThread } = await supabase.from('threads').select('id').eq('listing_id', parsed.data.listingId).eq('buyer_id', session.sub).maybeSingle();
  let threadId: string;

  if (existingThread) {
    threadId = existingThread.id;
  } else {
    const { data: newThread, error: threadError } = await supabase.from('threads').insert({ listing_id: parsed.data.listingId, buyer_id: session.sub, seller_id: listing.seller_id }).select('id').single();
    if (threadError || !newThread) return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
    threadId = newThread.id;
  }

  const { error } = await supabase.from('messages').insert({ thread_id: threadId, sender_id: session.sub, content: parsed.data.content });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger Notification for Seller
  await supabaseAdmin.from('notifications').insert({
    user_id: listing.seller_id,
    type: 'message',
    content: `New message regarding ${listing.title}`,
    link: `/messages/${threadId}`
  });

  return NextResponse.json({ success: true, threadId });
}