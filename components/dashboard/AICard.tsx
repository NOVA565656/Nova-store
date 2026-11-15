'use client';
import { useState } from 'react';

type AICardProps = {
  temperature: { temp: 'hot' | 'warm' | 'cold', insight: string, action: string, breakdown: string };
};

export default function AICard({ temperature }: AICardProps) {
  const [expanded, setExpanded] = useState(false);

  const colors = {
    hot: '#ef4444',
    warm: '#f59e0b',
    cold: '#3b82f6'
  };

  return (
    <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div 
        style={{ 
          background: '#fff', borderRadius: '24px', padding: '2rem', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
          borderTop: `8px solid ${colors[temperature.temp]}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{temperature.temp} Product</h3>
        </div>
        
        <p style={{ fontSize: '1.1rem', lineHeight: 1.5, color: '#374151' }}>{temperature.insight}</p>
        
        <button style={{ width: '100%', padding: '0.75rem', background: '#111827', color: '#fff', border: 'none', borderRadius: 999, marginTop: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          {temperature.action}
        </button>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: '#6b7280', border: 'none', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {expanded ? 'Hide Analysis' : 'See Analysis'}
        </button>

        {expanded && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: 12, fontSize: '0.9rem', color: '#4b5563' }}>
            {temperature.breakdown}
          </div>
        )}
      </div>
    </div>
  );
}