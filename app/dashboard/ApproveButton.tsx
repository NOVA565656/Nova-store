'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApproveButton({ listingId, disabled }: { listingId: string, disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}/approve`, { method: 'POST' });
    if (res.ok) {
      router.refresh(); // Refreshes the Server Component data
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to approve');
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={disabled || loading}
      style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: 8, opacity: (disabled || loading) ? 0.5 : 1 }}
    >
      {loading ? 'Approving...' : 'Approve & Publish'}
    </button>
  );
}