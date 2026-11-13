'use client';
import { useState } from 'react';

const menuStyle: React.CSSProperties = {
  position: 'absolute', right: '1rem', top: '3.1rem',
  background: 'white', border: '1px solid #e5e7eb', borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 200, overflow: 'hidden',
};
const itemStyle: React.CSSProperties = {
  display: 'block', padding: '0.6rem 1rem', color: '#111827',
  textDecoration: 'none', fontSize: '0.875rem',
};

export default function Menu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ padding: '0.4rem 0.9rem', borderRadius: 999, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
        aria-label="Menu"
      >
        ☰
      </button>
      {open && (
        <div style={menuStyle} role="menu">
          {signedIn ? (
            <>
              <a href="/dashboard" style={itemStyle}>Dashboard</a>
              <a href="/messages" style={itemStyle}>Review Messages</a>
              <a href="/notifications" style={itemStyle}>Notifications</a>
              <div style={{ borderTop: '1px solid #e5e7eb' }} />
              <form action="/auth/signout" method="post">
                <button type="submit" style={{ ...itemStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Logout
                </button>
              </form>
            </>
          ) : (
            <a href="/auth/signin/google" style={itemStyle}>Register</a>
          )}
        </div>
      )}
    </div>
  );
}