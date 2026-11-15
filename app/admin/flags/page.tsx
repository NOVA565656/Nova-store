import { supabaseAdmin } from '@/lib/db';
import { getSession } from '@/lib/auth/require';
import { redirect } from 'next/navigation';
import FlagToggle from './FlagToggle';

export const dynamic = 'force-dynamic';

export default async function AdminFlags() {
  const session = await getSession();
  if (!session) redirect('/');

  // Double check admin status for security
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', session.sub)
    .single();

  if (!profile?.is_admin) redirect('/');

  const { data: flags } = await supabaseAdmin
    .from('feature_flags')
    .select('*')
    .order('key');

  return (
    <div>
      <h1>Global Feature Flags</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {flags?.map(f => (
          <FlagToggle key={f.key} flag={f} />
        ))}
      </div>
    </div>
  );
}