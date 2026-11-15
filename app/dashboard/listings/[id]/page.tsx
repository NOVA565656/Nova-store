import { getSession, SESSION_COOKIE } from '@/lib/auth/require';
import { redirect, notFound } from 'next/navigation';
import { createUserClient } from '@/lib/supabase-client';
import { cookies } from 'next/headers';
import { getAITemperature, getDiscoveryTargets } from '@/lib/ai-discovery';
import AICard from '@/components/dashboard/AICard';
import DiscoveryCard from '@/components/dashboard/DiscoveryCard';
import Link from 'next/link';
import ToggleAvailability from '@/components/dashboard/ToggleAvailability';

export const dynamic = 'force-dynamic';

export default async function ListingDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) redirect('/');

  const supabase = createUserClient(rawToken);

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (!listing) notFound();

  // Mock analytics data (P7 will query the events table)
  const views = 124;
  const clicks = 18;
  
  const temperature = await getAITemperature(listing.id, views, clicks);
  const targets = await getDiscoveryTargets(listing.id);

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Back to Dashboard
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left Column: Analytics & Discovery */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ margin: 0 }}>{listing.title}</h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>{listing.type}</p>
            </div>
            
            <ToggleAvailability listingId={listing.id} initialStatus={listing.status} />
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginTop: 0 }}>Performance (Last 7 Days)</h2>
            {/* Mock Chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', height: 200, marginTop: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '100%', background: '#3b82f6', height: '100%', borderRadius: '8px 8px 0 0' }}></div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Views ({views})</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '100%', background: '#10b981', height: '40%', borderRadius: '8px 8px 0 0' }}></div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Clicks ({clicks})</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '100%', background: '#f59e0b', height: '15%', borderRadius: '8px 8px 0 0' }}></div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Carts (3)</span>
              </div>
            </div>
          </div>

          <DiscoveryCard targets={targets} />
        </div>

        {/* Right Column: Floating AI Card */}
        <AICard temperature={temperature} />
        
      </div>
    </div>
  );
}