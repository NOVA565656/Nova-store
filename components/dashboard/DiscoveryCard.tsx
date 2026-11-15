'use client';
import { useState } from 'react';

export default function DiscoveryCard({ targets, listingId }: { targets: any, listingId: string }) {
  const [publishing, setPublishing] = useState<string | null>(null);

  const handlePublish = async (pageId: string) => {
    setPublishing(pageId);
    const res = await fetch(`/api/listings/${listingId}/publish/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    });
    
    if (res.ok) alert('Published to Facebook successfully!');
    else alert('Failed to publish. Ensure your page is connected.');
    setPublishing(null);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e5e7eb', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>AI Discovery Targets</h2>
        <a href="/api/auth/facebook/connect" style={{ fontSize: '0.9rem', background: '#1877F2', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, textDecoration: 'none' }}>
          Connect Facebook Page
        </a>
      </div>
      
      <h3 style={{ marginTop: '1.5rem' }}>Facebook Pages (Auto-Publish Supported)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {targets.pages.map((p: any) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: 8 }}>
            <div>
              <strong>{p.name}</strong>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.followers} followers</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>{p.likelyToBuy}% match</span>
              <button 
                onClick={() => handlePublish(p.id)}
                disabled={publishing === p.id}
                style={{ padding: '0.4rem 0.8rem', background: '#1877F2', color: '#fff', border: 'none', borderRadius: 6, opacity: publishing === p.id ? 0.5 : 1 }}
              >
                {publishing === p.id ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>Facebook Groups (Manual Publish)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {targets.groups.map((g: any) => (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: 8 }}>
            <div>
              <strong>{g.name}</strong>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{g.members} members</div>
            </div>
            <a href={g.webLink} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: 6, fontSize: '0.9rem' }}>Open Group</a>
          </div>
        ))}
      </div>
    </div>
  );
}