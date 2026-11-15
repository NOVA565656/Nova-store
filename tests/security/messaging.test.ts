// @security:authz
// @security:ratelimit
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as sendMessage } from '../../app/api/messages/route';
import { getSession } from '../../lib/auth/require';
import { rateLimit } from '../../lib/rate-limit';
import { createUserClient } from '../../lib/supabase-client';
import { NextRequest } from 'next/server';

vi.mock('../../lib/auth/require', () => ({ getSession: vi.fn(), SESSION_COOKIE: 'session' }));
vi.mock('../../lib/rate-limit', () => ({ rateLimit: vi.fn() }));
vi.mock('../../lib/supabase-client', () => ({ createUserClient: vi.fn() }));
vi.mock('next/headers', () => ({ 
  cookies: vi.fn().mockResolvedValue({ get: vi.fn().mockReturnValue({ value: 'mock-token' }) }) 
}));

describe('@security:authz — messaging route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unauthenticated access', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/messages', { method: 'POST', body: '{}' });
    const res = await sendMessage(req);
    expect(res.status).toBe(401);
  });

  it('enforces rate limits', async () => {
    vi.mocked(getSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    vi.mocked(rateLimit).mockReturnValue(false);
    const req = new NextRequest('http://localhost/api/messages', { method: 'POST', body: '{}' });
    const res = await sendMessage(req);
    expect(res.status).toBe(429);
  });

  it('prevents messaging yourself', async () => {
    vi.mocked(getSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    vi.mocked(rateLimit).mockReturnValue(true);
    
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { seller_id: 'u1' }, error: null })
          })
        })
      })
    };
    vi.mocked(createUserClient).mockReturnValue(mockSupabase as never);

    const req = new NextRequest('http://localhost/api/messages', { 
      method: 'POST', 
      // FIXED: Using a valid UUID instead of '123'
      body: JSON.stringify({ listingId: '11111111-1111-1111-1111-111111111111', content: 'Hi' }) 
    });
    const res = await sendMessage(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Cannot message yourself');
  });
});