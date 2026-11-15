import { createPublicClient } from '@/lib/supabase-public';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  
  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(display_name, name_type)')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (!listing) notFound();

  const seller = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;

  // GEO/SEO: Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    offers: {
      '@type': 'Offer',
      price: listing.price || 0,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    seller: {
      '@type': seller.name_type === 'company' ? 'Organization' : 'Person',
      name: seller.display_name,
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Link href="/" style={{ color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Home
      </Link>

      <div style={{ background: '#f9fafb', borderRadius: 12, padding: '2rem' }}>
        <h1 style={{ marginTop: 0 }}>{listing.title}</h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{listing.price ? `$${listing.price}` : 'Contact for price'}</p>
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
          {listing.description}
        </div>
        
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <p>Sold by: <Link href={`/profile/${seller.id}`} style={{ fontWeight: 'bold', color: '#2563eb' }}>{seller.display_name}</Link></p>
          {seller.name_type === 'company' ? '🏭 Company' : '🥈 Individual'}
        </div>
      </div>
    </main>
  );
}