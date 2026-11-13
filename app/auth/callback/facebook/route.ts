import { NextRequest, NextResponse } from 'next/server';
import { signSession } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/require';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 });

  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.FACEBOOK_CLIENT_ID ?? '',
        client_secret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
        redirect_uri: `${process.env.APP_URL}/auth/callback/facebook`,
        code,
      }),
  );
  if (!tokenRes.ok) return NextResponse.json({ error: 'token exchange failed' }, { status: 502 });
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const meRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`,
  );
  if (!meRes.ok) return NextResponse.json({ error: 'profile fetch failed' }, { status: 502 });
  const me = (await meRes.json()) as { id: string; name: string; email?: string };

  const email = me.email ?? `${me.id}@facebook.local`;
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email, email_confirm: true, user_metadata: { display_name: me.name, name_type: 'nickname' },
  });
  const userId = created?.user?.id;
  if (error && !error.message.toLowerCase().includes('already')) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!userId) {
    const { data } = await supabaseAdmin.from('profiles').select('id').eq('display_name', me.name).limit(1);
    return NextResponse.json({ error: 'user resolution failed', hint: data }, { status: 500 });
  }

  const token = await signSession({
    sub: userId, role: 'seller', displayName: me.name, nameType: 'nickname',
  });
  const res = NextResponse.redirect(`${process.env.APP_URL}/`);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, path: '/',
  });
  return res;
}