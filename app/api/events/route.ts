import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-public';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const eventSchema = z.object({
  listingId: z.string().uuid(),
  eventType: z.enum(['view', 'click', 'cart', 'message_intent'])
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  const allowed = await rateLimit(`events:${ip}`, 60, 60_000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const supabase = createPublicClient();

  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', parsed.data.listingId)
    .eq('status', 'published')
    .single();

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  await supabase.from('events').insert({
    listing_id: parsed.data.listingId,
    event_type: parsed.data.eventType
  });

  return NextResponse.json({ success: true });
}