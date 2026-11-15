import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require';
import { supabaseAdmin } from '@/lib/db';
import { decryptToken } from '@/lib/crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pageId } = await req.json();
  if (!pageId) return NextResponse.json({ error: 'Page ID required' }, { status: 400 });

  // Get Listing and Page Token
  const { data: listing } = await supabaseAdmin.from('listings').select('title, description, seller_id').eq('id', id).single();
  const { data: fbPage } = await supabaseAdmin.from('fb_pages').select('encrypted_token').eq('seller_id', session.sub).eq('page_id', pageId).single();

  if (!listing || listing.seller_id !== session.sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!fbPage) return NextResponse.json({ error: 'Page not connected' }, { status: 400 });

  const decryptedToken = decryptToken(fbPage.encrypted_token);

  // Publish to Facebook
  const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `${listing.title}\n\n${listing.description}\n\nView here: ${process.env.APP_URL}/products/${id}`,
      access_token: decryptedToken,
    }),
  });

  if (!fbRes.ok) {
    return NextResponse.json({ error: 'Facebook API error' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}