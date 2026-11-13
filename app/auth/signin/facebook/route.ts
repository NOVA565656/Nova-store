import { NextResponse } from 'next/server';

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID ?? '',
    redirect_uri: `${process.env.APP_URL}/auth/callback/facebook`,
    scope: 'public_profile,email',
    response_type: 'code',
    state: 'p1',
  });
  return NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
}