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

  const { data: updated, error } = await supabase
    .from('listings')
    .update({ status: 'published' })
    .eq('id', id)
    .eq('status', 'plan_ready')
    .eq('type', 'product')
    .select()
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (updated) {
    return NextResponse.json({ success: true });
  }

  const { data: skill } = await supabase
    .from('listings')
    .select('id, type, proof_verified, status')
    .eq('id', id)
    .single();

  if (skill && skill.type === 'skill') {
    if (skill.status !== 'plan_ready') {
      return NextResponse.json({ error: 'Listing is not in a state that can be approved' }, { status: 400 });
    }
    if (!skill.proof_verified) {
      return NextResponse.json({ error: 'Skill must be verified before publishing' }, { status: 400 });
    }

    const { data: skillUpdated, error: skillError } = await supabase
      .from('listings')
      .update({ status: 'published' })
      .eq('id', id)
      .eq('status', 'plan_ready')
      .select()
      .single();

    if (skillError || !skillUpdated) {
      return NextResponse.json({ error: 'Listing is not in a state that can be approved' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Listing is not in a state that can be approved' }, { status: 400 });
}