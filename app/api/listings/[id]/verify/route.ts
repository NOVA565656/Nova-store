import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { createUserClient } from '@/lib/supabase-client';
import { generateVerificationKey, hashKey } from '@/lib/crypto';
import { verifyPlatformProof } from '@/lib/verification';
import { rateLimit } from '@/lib/rate-limit';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Rate Limiting Check
  if (!rateLimit(`verify:${session.sub}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  // 2. User-Scoped Client (RLS Enforced)
  const supabase = createUserClient(rawToken);
  const { platform, proofUrl, submittedKey } = await req.json();

  const { data: listing } = await supabase
    .from('listings')
    .select('id, type')
    .eq('id', params.id)
    .single();

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (platform === 'website') {
    const result = await verifyPlatformProof(platform, proofUrl, '');
    if (result.success) {
      await supabase.from('listings').update({ proof_verified: true }).eq('id', listing.id);
      return NextResponse.json({ success: true, message: 'Website verified' });
    }
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  // Key Generation Phase
  if (!submittedKey) {
    const plaintextKey = generateVerificationKey();
    const hashedKey = hashKey(plaintextKey);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('verification_keys').insert({
      listing_id: listing.id,
      platform,
      key_hash: hashedKey,
      expires_at: expiresAt,
    });

    return NextResponse.json({ 
      action: 'key_generated', 
      key: plaintextKey, 
      instructions: `Create a file named verify.txt in your repo and paste this key inside.` 
    });
  }

  // Verification Phase
  const { data: activeKey } = await supabase
    .from('verification_keys')
    .select('id, key_hash, expires_at')
    .eq('listing_id', listing.id)
    .eq('platform', platform)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!activeKey) return NextResponse.json({ error: 'No active key found. Generate one first.' }, { status: 400 });
  if (new Date(activeKey.expires_at) < new Date()) return NextResponse.json({ error: 'Key expired' }, { status: 400 });

  if (hashKey(submittedKey) !== activeKey.key_hash) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const result = await verifyPlatformProof(platform, proofUrl, submittedKey);
  if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });

  // 3. Atomic Key Consumption
  const { data: consumed, error: consumeErr } = await supabase
    .from('verification_keys')
    .update({ used_at: new Date().toISOString() })
    .eq('id', activeKey.id)
    .is('used_at', null)
    .select()
    .single();

  if (consumeErr || !consumed) {
    return NextResponse.json({ error: 'Key already used' }, { status: 400 });
  }

  await supabase.from('listings').update({ proof_verified: true }).eq('id', listing.id);

  return NextResponse.json({ success: true, message: 'Verification passed' });
}