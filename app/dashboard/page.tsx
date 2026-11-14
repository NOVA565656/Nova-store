import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { redirect } from 'next/navigation';
import { createUserClient } from '@/lib/supabase-client';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ApproveButton from './ApproveButton';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect('/');

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) redirect('/');

  const supabase = createUserClient(rawToken);

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

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
                
                {l.type === 'skill' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: l.proof_verified ? 'green' : 'red' }}>
                      {l.proof_verified ? '✅ Skill Verified' : '❌ Skill Not Verified'}
                    </span>
                  </div>
                )}

                <ApproveButton listingId={l.id} disabled={l.type === 'skill' && !l.proof_verified} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}