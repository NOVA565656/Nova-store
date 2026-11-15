'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';

// Since we need dynamic Add to Cart, we make this a Client Component
export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      // Fetch data from API or pass via props in a real app
      // For this phase, we simulate fetching
      fetch(`/api/public/listings/${p.id}`).then(r => r.json()).then(setListing);
    });
  }, [params]);

  if (!listing || !id) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Home
      </Link>

      <div style={{ background: '#f9fafb', borderRadius: 12, padding: '2rem' }}>
        <h1 style={{ marginTop: 0 }}>{listing.title}</h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{listing.price ? `$${listing.price}` : 'Contact for price'}</p>
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>{listing.description}</div>
        
        <button 
          onClick={() => addToCart({ listingId: listing.id, sellerId: listing.seller_id, title: listing.title, price: listing.price })}
          style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: '#000', color: '#fff', border: 'none', borderRadius: 8 }}
        >
          Add to Cart
        </button>
      </div>
    </main>
  );
}