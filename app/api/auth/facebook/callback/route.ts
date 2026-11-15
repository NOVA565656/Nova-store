import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require';
import { supabaseAdmin } from '@/lib/db';
import { encryptToken } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const code = req.nextUrl.searchParams.get('code');
  const stateParam = req.nextUrl.searchParams.get('state');
  const stateCookie = req.cookies.get('fb_page_state')?.value;

  if (!code || !stateParam || stateParam !== stateCookie) {
    return NextResponse.json({ error: 'Invalid state or code' }, { status: 400 });
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` + new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID ?? '',
      client_secret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
      redirect_uri: `${process.env.APP_URL}/api/auth/facebook/callback`,
      code,
    }));
    
    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 502 });
    }
    const tokenData = await tokenRes.json() as { access_token?: string };
    const access_token = tokenData.access_token;

    if (!access_token) return NextResponse.json({ error: 'No access token returned' }, { status: 502 });

    // Fetch user's pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${access_token}`);
    
    if (!pagesRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 502 });
    }
    const pagesData = await pagesRes.json() as { data?: { id: string; name: string; access_token: string }[] };

    if (pagesData.data && pagesData.data.length > 0) {
      const pagesToInsert = pagesData.data.map((p) => ({
        seller_id: session.sub,
        page_id: p.id,
        page_name: p.name,
        encrypted_token: encryptToken(p.access_token),
      }));

      await supabaseAdmin.from('fb_pages').upsert(pagesToInsert, { onConflict: 'seller_id,page_id' });
    }

    const res = NextResponse.redirect(`${process.env.APP_URL}/dashboard`);
    res.cookies.delete('fb_page_state');
    return res;

  } catch {
    return NextResponse.json({ error: 'Invalid response from Facebook' }, { status: 502 });
  }
}