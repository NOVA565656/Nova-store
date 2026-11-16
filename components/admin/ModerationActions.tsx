'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ModerationActions({ messageId }: { messageId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDismiss = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/moderation/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId })
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to dismiss');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
      <button 
        onClick={handleDismiss}
        disabled={loading}
        style={{ padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, opacity: loading ? 0.5 : 1 }}
      >
        {loading ? 'Processing...' : 'Dismiss'}
      </button>
      <button style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6 }}>Suspend User</button>
    </div>
  );
}