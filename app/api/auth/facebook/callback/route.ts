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

  // Exchange code for short-lived token
  const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` + new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID ?? '',
    client_secret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    redirect_uri: `${process.env.APP_URL}/api/auth/facebook/callback`,
    code,
  }));
  const { access_token } = await tokenRes.json();

  // Fetch user's pages
  const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${access_token}`);
  const pagesData = await pagesRes.json();

  if (pagesData.data && pagesData.data.length > 0) {
    // Save each page with encrypted token
    const pagesToInsert = pagesData.data.map((p: any) => ({
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
}