import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  // Meta sends a signed_request (base64 encoded payload)
  const body = await req.formData();
  const signedRequest = body.get('signed_request') as string;
  
  if (signedRequest) {
    try {
      const [, payloadBase64] = signedRequest.split('.');
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      const fbUserId = payload.user_id;
      
      // Delete all FB pages associated with this user (simplified for P8)
      // In production, you'd map fbUserId to your profile ID via the user_oauth table
      // await supabaseAdmin.from('fb_pages').delete().eq('seller_id', ...);
      
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  }

  return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
}