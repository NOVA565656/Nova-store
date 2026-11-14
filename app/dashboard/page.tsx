'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    const res = await fetch('/api/listings');
    if (res.ok) setListings(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/listings/${id}/approve`, { method: 'POST' });
    if (res.ok) fetchListings();
    else alert((await res.json()).error);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Seller Dashboard</h1>
      <Link href="/listings/new" style={{ display: 'inline-block', marginBottom: '1rem', background: '#000', color: '#fff', padding: '0.5rem 1rem', borderRadius: 8 }}>
        + New Listing
      </Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {listings.map(l => (
          <div key={l.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
            <h3>{l.title} <span style={{ fontSize: '0.8rem', background: '#eee', padding: '0.2rem 0.5rem', borderRadius: 8 }}>{l.status}</span></h3>
            
            {l.status === 'plan_ready' && (
              <div style={{ marginTop: '1rem', background: '#f0fdf4', padding: '1rem', borderRadius: 8 }}>
                <p><strong>AI Plan Ready:</strong> {l.ai_plan?.rewrittenTitle}</p>
                
                {l.type === 'skill' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: l.proof_verified ? 'green' : 'red' }}>
                      {l.proof_verified ? '✅ Skill Verified' : '❌ Skill Not Verified'}
                    </span>
                  </div>
                )}

                <button 
                  onClick={() => handleApprove(l.id)}
                  disabled={l.type === 'skill' && !l.proof_verified}
                  style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: 8, opacity: (l.type === 'skill' && !l.proof_verified) ? 0.5 : 1 }}
                >
                  Approve & Publish
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}