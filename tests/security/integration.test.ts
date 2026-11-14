// @security:authz
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createListing } from '../../app/api/listings/route';
import { POST as approveListing } from '../../app/api/listings/[id]/approve/route';
import { getSession } from '../../lib/auth/require';
import { requireRoleForVerifiedSession, AuthError } from '../../lib/auth/session';
import { rateLimit } from '../../lib/rate-limit';
import { supabaseAdmin } from '../../lib/db';
import { NextRequest } from 'next/server';

vi.mock('../../lib/auth/require', () => ({ getSession: vi.fn() }));
vi.mock('../../lib/auth/session', () => ({ 
  requireRoleForVerifiedSession: vi.fn(),
  AuthError: class extends Error { constructor(public kind: string, public status: number) { super(kind); } }
}));
vi.mock('../../lib/rate-limit', () => ({ rateLimit: vi.fn() }));
vi.mock('../../lib/db', () => ({ supabaseAdmin: { from: vi.fn() } }));
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({ get: vi.fn() }) }));

describe('@security:authz — route-level integration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enforces rate limiting on listing creation', async () => {
    vi.mocked(getSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    vi.mocked(requireRoleForVerifiedSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    vi.mocked(rateLimit).mockReturnValue(false);

    const req = new NextRequest('http://localhost/api/listings', { method: 'POST', body: JSON.stringify({}) });
    const res = await createListing(req);

    expect(res.status).toBe(429);
  });

  it('blocks unverified skills from being approved', async () => {
    vi.mocked(getSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    
    // Mock listing lookup returning an unverified skill
    const mockSingle = vi.fn().mockResolvedValue({ 
      data: { id: 'l1', seller_id: 'u1', type: 'skill', proof_verified: false }, 
      error: null 
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as never);

    const req = new NextRequest('http://localhost/api/listings/l1/approve', { method: 'POST' });
    const res = await approveListing(req, { params: { id: 'l1' } });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('must be verified');
  });
});