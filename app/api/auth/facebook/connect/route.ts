import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/require';
import { randomUUID } from 'crypto';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const state = randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID ?? '',
    redirect_uri: `${process.env.APP_URL}/api/auth/facebook/callback`,
    scope: 'pages_show_list,pages_manage_posts,read_insights',
    state,
  });

  const res = NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
  res.cookies.set('fb_page_state', state, { httpOnly: true, maxAge: 600, path: '/' });
  return res;
}