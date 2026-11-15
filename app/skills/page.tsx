import Link from 'next/link';
import Image from 'next/image';
import { createPublicClient } from '@/lib/supabase-public';

export const revalidate = 60;

export default async function SkillsPage() {
  const supabase = createPublicClient();
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'published')
    .eq('type', 'skill')
    .order('created_at', { ascending: false });

  return (
    <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Explore Skills</h1>
        <Link href="/" style={{ padding: '0.4rem 0.9rem', borderRadius: 999, border: '1px solid #d1d5db', textDecoration: 'none', color: '#111827', fontSize: '0.875rem' }}>
          Switch to Products
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {listings?.map(l => (
          <Link key={l.id} href={`/skills/${l.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
              <div style={{ position: 'relative', background: '#f3f4f6', height: 150, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                {l.images?.[0] ? <Image src={l.images[0]} alt={l.title} fill style={{ objectFit: 'cover', borderRadius: 8 }} /> : 'No Image'}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{l.title}</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{l.price ? `$${l.price}` : 'Contact for price'}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}