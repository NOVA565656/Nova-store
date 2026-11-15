'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, removeFromCart, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  if (items.length === 0) return null;

  const handleMessageAll = async () => {
    setSending(true);
    const uniqueSellers = Array.from(new Set(items.map(i => i.sellerId)));
    
    for (const sellerId of uniqueSellers) {
      const sellerItems = items.filter(i => i.sellerId === sellerId);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: sellerItems[0].listingId,
          content: message || `Hi, I'm interested in: ${sellerItems.map(i => i.title).join(', ')}`
        })
      });

      if (res.status === 401) {
        // Trigger signup gate (P5)
        router.push('/auth/signin/google');
        setSending(false);
        return;
      }
    }

    clearCart();
    setSending(false);
    setIsOpen(false);
    router.push('/messages');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem', borderRadius: '50%', background: '#000', color: '#fff', border: 'none', zIndex: 50 }}
      >
        Cart ({items.length})
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', width: 400, padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Your Cart</h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', marginTop: '2rem' }}>
              {items.map(i => (
                <div key={i.listingId} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                  <p style={{ margin: 0 }}>{i.title}</p>
                  <button onClick={() => removeFromCart(i.listingId)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>Remove</button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <textarea 
                placeholder="Add a message for the sellers..." 
                value={message} onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', height: 80, padding: '0.5rem', marginBottom: '1rem' }}
              />
              <button 
                onClick={handleMessageAll}
                disabled={sending}
                style={{ width: '100%', padding: '1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, opacity: sending ? 0.5 : 1 }}
              >
                {sending ? 'Sending...' : 'Message All Sellers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}