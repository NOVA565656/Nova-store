// @security:authz
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createListing } from '../../app/api/listings/route';
import { getSession } from '../../lib/auth/require';
import { requireRoleForVerifiedSession } from '../../lib/auth/session';
import { rateLimit } from '../../lib/rate-limit';
import { NextRequest } from 'next/server';

vi.mock('../../lib/auth/require', () => ({ getSession: vi.fn(), SESSION_COOKIE: 'session' }));
vi.mock('../../lib/auth/session', () => ({ 
  requireRoleForVerifiedSession: vi.fn(),
  AuthError: class extends Error { constructor(public kind: string, public status: number) { super(kind); } }
}));
vi.mock('../../lib/rate-limit', () => ({ rateLimit: vi.fn() }));
vi.mock('../../lib/db', () => ({ supabaseAdmin: { from: vi.fn() } }));
vi.mock('next/headers', () => ({ cookies: () => ({ get: () => ({ value: 'fake-token' }) }) }));

describe('@security:authz — route-level integration (P2 GAP-5)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enforces rate limiting before processing', async () => {
    vi.mocked(getSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    vi.mocked(requireRoleForVerifiedSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    vi.mocked(rateLimit).mockReturnValue(false);

    const req = new NextRequest('http://localhost/api/listings', { method: 'POST', body: JSON.stringify({}) });
    const res = await createListing(req);

    expect(res.status).toBe(429);
    expect(rateLimit).toHaveBeenCalledWith('create_listing:u1', 5, 60000);
  });

  it('rejects unauthenticated users', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const { AuthError } = await import('../../lib/auth/session');
    vi.mocked(requireRoleForVerifiedSession).mockRejectedValue(new AuthError('unauthorized', 401));

    const req = new NextRequest('http://localhost/api/listings', { method: 'POST', body: '{}' });
    const res = await createListing(req);

    expect(res.status).toBe(401);
  });
});