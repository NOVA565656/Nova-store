'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ToggleAvailability({ listingId, initialStatus }: { listingId: string, initialStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const router = useRouter();

  const toggle = async () => {
    setIsLoading(true);
    const res = await fetch(`/api/listings/${listingId}/toggle`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setStatus(data.status);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Availability</span>
      <button
        onClick={toggle}
        disabled={isLoading}
        style={{
          width: 50, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: status === 'published' ? '#10b981' : '#e5e7eb',
          position: 'relative', transition: 'all 0.2s', opacity: isLoading ? 0.5 : 1
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 4, left: status === 'published' ? 26 : 4, transition: 'all 0.2s'
        }} />
      </button>
    </div>
  );
}