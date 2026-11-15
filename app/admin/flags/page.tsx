'use client';
import { useEffect, useState } from 'react';

type Flag = { key: string, is_enabled: boolean, description: string };

export default function AdminFlags() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    // In a real app, this should be a GET API. For P7, we simulate it.
    const res = await fetch('/api/admin/flags/list');
    if (res.ok) setFlags(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  const toggle = async (key: string, current: boolean) => {
    const res = await fetch('/api/admin/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, is_enabled: !current })
    });
    if (res.ok) fetchFlags();
  };

  if (loading) return <div>Loading flags...</div>;

  return (
    <div>
      <h1>Global Feature Flags</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {flags.map(f => (
          <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'monospace' }}>{f.key}</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{f.description}</p>
            </div>
            <button 
              onClick={() => toggle(f.key, f.is_enabled)}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: 999, border: 'none', fontWeight: 'bold',
                background: f.is_enabled ? '#10b981' : '#ef4444', color: '#fff', cursor: 'pointer'
              }}
            >
              {f.is_enabled ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}