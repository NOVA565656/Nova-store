'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Flag = { 
  key: string; 
  is_enabled: boolean; 
  description: string;
};

export default function FlagToggle({ flag }: { flag: Flag }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: flag.key, is_enabled: !flag.is_enabled })
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to update flag');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      background: '#fff', padding: '1.5rem', borderRadius: 8, 
      border: '1px solid #e5e7eb', opacity: loading ? 0.5 : 1 
    }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: 'monospace' }}>{flag.key}</h3>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{flag.description}</p>
      </div>
      <button 
        onClick={toggle}
        disabled={loading}
        style={{ 
          padding: '0.5rem 1rem', borderRadius: 999, border: 'none', fontWeight: 'bold',
          background: flag.is_enabled ? '#10b981' : '#ef4444', color: '#fff', 
          cursor: loading ? 'not-allowed' : 'pointer' 
        }}
      >
        {flag.is_enabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}