import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { redirect } from 'next/navigation';
import { createUserClient } from '@/lib/supabase-client';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Inbox() {
  const session = await getSession();
  if (!session) redirect('/');

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) redirect('/');

  const supabase = createUserClient(rawToken);

  const { data: threads } = await supabase
    .from('threads')
    .select('id, buyer_id, seller_id, listings(title)')
    .or(`buyer_id.eq.${session.sub},seller_id.eq.${session.sub}`)
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Inbox</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {threads?.map(t => {
          const listing = Array.isArray(t.listings) ? t.listings[0] : t.listings;
          return (
            <Link key={t.id} href={`/messages/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
                <h3 style={{ margin: 0 }}>{listing?.title}</h3>
                <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  {t.buyer_id === session.sub ? 'To: Seller' : 'From: Buyer'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}