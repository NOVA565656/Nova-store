import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { createUserClient } from '@/lib/supabase-client';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const supabase = createUserClient(rawToken);

  // Fetch the listing (ensuring ownership implicitly via RLS, but explicit here)
  const { data: listing } = await supabase
    .from('listings')
    .select('status')
    .eq('id', id)
    .eq('seller_id', session.sub)
    .single();

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Strict State Machine: Only published ⇄ paused is allowed
  if (listing.status !== 'published' && listing.status !== 'paused') {
    return NextResponse.json({ error: 'Only published listings can be paused' }, { status: 400 });
  }

  const newStatus = listing.status === 'published' ? 'paused' : 'published';

  const { error } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('seller_id', session.sub);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ success: true, status: newStatus });
}