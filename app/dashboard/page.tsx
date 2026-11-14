import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { redirect } from 'next/navigation';
import { createUserClient } from '@/lib/supabase-client';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect('/');

  const rawToken = (await cookies()).get(SESSION_COOKIE)?.value!;
  const supabase = createUserClient(rawToken);

  const { data: listings } = await supabase.from('listings').select('*');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Seller Dashboard</h1>
      <Link href="/listings/new" style={{ display: 'inline-block', marginBottom: '1rem', background: '#000', color: '#fff', padding: '0.5rem 1rem', borderRadius: 8 }}>
        + New Listing
      </Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {listings?.map(l => (
          <div key={l.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
            <h3>{l.title} <span style={{ fontSize: '0.8rem', background: '#eee', padding: '0.2rem 0.5rem', borderRadius: 8 }}>{l.status}</span></h3>
            {l.status === 'plan_ready' && (
              <div style={{ marginTop: '1rem', background: '#f0fdf4', padding: '1rem', borderRadius: 8 }}>
                <p><strong>AI Plan Ready:</strong> {l.ai_plan?.rewrittenTitle}</p>
                <button style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: 8 }}>Approve & Publish</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}