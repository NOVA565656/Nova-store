import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const signedRequest = body.get('signed_request') as string;
  
  if (!signedRequest) {
    return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
  }

  try {
    const [encodedSig, payload] = signedRequest.split('.');
    if (!encodedSig || !payload) {
      return NextResponse.json({ error: 'Invalid signed_request format' }, { status: 400 });
    }

    // Decode base64url
    const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    
    // Create expected signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.FACEBOOK_CLIENT_SECRET ?? '')
      .update(payload)
      .digest();

    // Timing-safe comparison
    if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(sig, expectedSig)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Decode payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );

    const fbUserId = decodedPayload.user_id;
    console.log(`[Deauthorize] User ${fbUserId} has deauthorized the app.`);

    // In production, you would delete the fb_pages tokens associated with this user.
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}