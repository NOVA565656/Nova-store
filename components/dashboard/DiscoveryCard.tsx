export default function DiscoveryCard({ targets }: { targets: { pages: { id: string, name: string, followers: string, likelyToBuy: number }[], groups: { id: string, name: string, members: string, deepLink: string, webLink: string }[] } }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e5e7eb', marginTop: '2rem' }}>
      <h2 style={{ marginTop: 0 }}>AI Discovery Targets</h2>
      
      <h3>Facebook Pages (Auto-Publish Supported)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {targets.pages.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: 8 }}>
            <div>
              <strong>{p.name}</strong>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.followers} followers</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>{p.likelyToBuy}% match</span>
              <button style={{ padding: '0.4rem 0.8rem', background: '#e5e7eb', border: 'none', borderRadius: 6 }}>Publish</button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>Facebook Groups (Manual Publish)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {targets.groups.map(g => (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: 8 }}>
            <div>
              <strong>{g.name}</strong>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{g.members} members</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <a href={g.webLink} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: 6, fontSize: '0.9rem' }}>Open Group</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}