import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { requireRoleForVerifiedSession, AuthError } from '@/lib/auth/session';
import { rateLimit } from '@/lib/rate-limit';
import { createUserClient } from '@/lib/supabase-client';
import { enqueueJob } from '@/lib/jobs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createSchema = z.object({
  type: z.enum(['product', 'skill']),
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().optional(),
  proof_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    await requireRoleForVerifiedSession(session, 'seller');
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.kind }, { status: e.status });
    throw e;
  }

  if (!rateLimit(`create_listing:${session.sub}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const supabase = createUserClient(rawToken);

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      seller_id: session.sub,
      status: 'ai_scanning',
      ...parsed.data,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await enqueueJob(listing.id, 'full_pipeline');

  return NextResponse.json(listing, { status: 201 });
}