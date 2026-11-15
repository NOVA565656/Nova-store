import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require';
import { supabaseAdmin } from '@/lib/db';
import { z } from 'zod';

const toggleSchema = z.object({
  key: z.string(),
  is_enabled: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify Admin Status
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', session.sub)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  // Update Flag
  const { error } = await supabaseAdmin
    .from('feature_flags')
    .update({ is_enabled: parsed.data.is_enabled })
    .eq('key', parsed.data.key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit Log
  await supabaseAdmin.from('admin_logs').insert({
    admin_id: session.sub,
    action: 'toggle_flag',
    details: { key: parsed.data.key, enabled: parsed.data.is_enabled },
  });

  return NextResponse.json({ success: true });
}