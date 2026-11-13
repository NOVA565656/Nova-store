import { NextRequest, NextResponse } from 'next/server';
import { signSession } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/require';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: `${process.env.APP_URL}/auth/callback/google`,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) return NextResponse.json({ error: 'token exchange failed' }, { status: 502 });
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const meRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!meRes.ok) return NextResponse.json({ error: 'profile fetch failed' }, { status: 502 });
  const me = (await meRes.json()) as { sub: string; email: string; name: string };

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: me.email, email_confirm: true,
    user_metadata: { display_name: me.name, name_type: 'nickname' },
  });
  if (error && !error.message.toLowerCase().includes('already')) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', created?.user?.id ?? '').maybeSingle();
  const userId = created?.user?.id ?? profile?.id;
  if (!userId) return NextResponse.json({ error: 'user resolution failed' }, { status: 500 });

  const token = await signSession({
    sub: userId, role: 'buyer', displayName: me.name, nameType: 'nickname',
  });
  const res = NextResponse.redirect(`${process.env.APP_URL}/`);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, path: '/',
  });
  return res;
}