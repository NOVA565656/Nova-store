'use client';
import { useCart } from '@/lib/cart-context';

type ListingProps = {
  id: string;
  seller_id: string;
  title: string;
  price: number | null;
};

export default function AddToCartButton({ listing }: { listing: ListingProps }) {
  const { addToCart } = useCart();

  return (
    <button 
      onClick={() => addToCart({ 
        listingId: listing.id, 
        sellerId: listing.seller_id, 
        title: listing.title, 
        price: listing.price 
      })}
      style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: '#000', color: '#fff', border: 'none', borderRadius: 8 }}
    >
      Add to Cart
    </button>
  );
}