import { supabaseAdmin } from '@/lib/db';
import { getSession } from '@/lib/auth/require';
import { redirect } from 'next/navigation';
import ModerationActions from '@/components/admin/ModerationActions';

export const dynamic = 'force-dynamic';

export default async function AdminModeration() {
  const session = await getSession();
  if (!session) redirect('/');

  const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', session.sub).single();
  if (!profile?.is_admin) redirect('/');

  const { data: flagged } = await supabaseAdmin
    .from('messages')
    .select('id, content, flag_reason, created_at, sender_id')
    .eq('is_flagged', true)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1>Flagged Messages</h1>
      <p style={{ color: '#6b7280' }}>Review these messages for abuse or spam.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {flagged?.length === 0 && <p>No flagged messages.</p>}
        
        {flagged?.map(m => (
          <div key={m.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Sender ID: {m.sender_id}</span>
              <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>Flagged: {m.flag_reason}</span>
            </div>
            <p style={{ background: '#f9fafb', padding: '1rem', borderRadius: 6 }}>{m.content}</p>
            
            <ModerationActions messageId={m.id} />
            
          </div>
        ))}
      </div>
    </div>
  );
}