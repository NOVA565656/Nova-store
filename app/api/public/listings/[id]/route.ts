import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-public';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  return NextResponse.json(listing);
}