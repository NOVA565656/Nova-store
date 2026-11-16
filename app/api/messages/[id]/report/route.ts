import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { createUserClient } from '@/lib/supabase-client';
import { cookies } from 'next/headers';
import { z } from 'zod';

const reportSchema = z.object({ reason: z.string().min(1).max(500) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const supabase = createUserClient(rawToken);
  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });

  // SECURITY FIX: Verify user is part of the thread before allowing flag
  const { data: message } = await supabase
    .from('messages')
    .select('thread_id, threads(buyer_id, seller_id)')
    .eq('id', id)
    .single();

  if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  const thread = Array.isArray(message.threads) ? message.threads[0] : message.threads;
  
  if (thread.buyer_id !== session.sub && thread.seller_id !== session.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('messages')
    .update({ is_flagged: true, flag_reason: parsed.data.reason })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}