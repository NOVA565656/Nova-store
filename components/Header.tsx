import Link from 'next/link';
import { getSession } from '@/lib/auth/require';
import Menu from './Menu';

const pill: React.CSSProperties = {
  padding: '0.4rem 0.9rem',
  borderRadius: '999px',
  border: '1px solid #d1d5db',
  textDecoration: 'none',
  color: '#111827',
  fontSize: '0.875rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const dot: React.CSSProperties = {
  display: 'inline-block',
  width: 8, height: 8, borderRadius: '50%', background: '#10b981',
};

const frame = (type: 'nickname' | 'company'): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 14,
  background: type === 'company' ? '#e5e7eb' : '#f3f4f6',
  border: type === 'company' ? '2px solid #6b7280' : '2px solid #cbd5e1',
});

export default async function Header() {
  const session = await getSession();
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.6rem 1rem', borderBottom: '1px solid #e5e7eb',
        position: 'sticky', top: 0, background: 'white', zIndex: 10,
      }}
    >
      <Link href="/?type=skill" style={pill}>Switch to Skills</Link>
      <div style={{ flex: 1 }} />
      {session ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={frame(session.nameType)}>{session.nameType === 'company' ? '🏭' : '🥈'}</span>
          <span style={{ fontSize: '0.85rem', color: '#111827' }}>{session.displayName}</span>
          <span style={dot} aria-label="Active" />
          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
            {session.nameType === 'company' ? 'Company' : 'Individual'}
          </span>
        </div>
      ) : (
        <>
          <Link href="/auth/signin/google" style={pill}>Buy</Link>
          <Link href="/auth/signin/facebook" style={pill}>Sell</Link>
        </>
      )}
      <Menu signedIn={!!session} />
    </header>
  );
}