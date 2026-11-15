import { getSession } from '@/lib/auth/require';
import { supabaseAdmin } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', session.sub)
    .single();

  if (!profile?.is_admin) {
    redirect('/'); // Kick non-admins out
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <aside style={{ width: 250, background: '#111827', color: '#fff', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/admin" style={{ color: '#d1d5db', textDecoration: 'none' }}>Overview</Link>
          <Link href="/admin/flags" style={{ color: '#d1d5db', textDecoration: 'none' }}>Feature Flags</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '3rem' }}>
        {children}
      </main>
    </div>
  );
}