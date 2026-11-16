import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require';
import { supabaseAdmin } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ messageId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', session.sub).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('messages')
    .update({ is_flagged: false, flag_reason: null })
    .eq('id', parsed.data.messageId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}