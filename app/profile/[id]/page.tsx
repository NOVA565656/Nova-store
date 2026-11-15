import { createPublicClient } from '@/lib/supabase-public';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (!profile) notFound();

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', id)
    .eq('status', 'published');

  return (
    <main style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: 8, marginBottom: '2rem' }}>
        <p style={{ margin: 0 }}>You are browsing <strong>{profile.display_name}</strong>&apos;s profile. <Link href="/" style={{ color: '#10b981' }}>Sign up to message sellers</Link>.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          {profile.name_type === 'company' ? '🏭' : '🥈'}
        </div>
        <div>
          <h1 style={{ margin: 0 }}>{profile.display_name}</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>{profile.name_type === 'company' ? 'Company' : 'Individual'}</p>
        </div>
      </div>

      <h2>Listings</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        {listings?.map(l => (
          <Link key={l.id} href={`/${l.type === 'product' ? 'products' : 'skills'}/${l.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem' }}>
              <h3 style={{ margin: 0 }}>{l.title}</h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', background: '#eee', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 8 }}>{l.type}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}