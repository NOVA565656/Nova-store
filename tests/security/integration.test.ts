// @security:authz
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createListing } from '../../app/api/listings/route';
import { POST as approveListing } from '../../app/api/listings/[id]/approve/route';
import { getSession } from '../../lib/auth/require';
import { requireRoleForVerifiedSession, AuthError } from '../../lib/auth/session';
import { rateLimit } from '../../lib/rate-limit';
import { createUserClient } from '../../lib/supabase-client';
import { NextRequest } from 'next/server';

// 1. Fix the require mock to include SESSION_COOKIE
vi.mock('../../lib/auth/require', () => ({ 
  getSession: vi.fn(),
  SESSION_COOKIE: 'session'
}));

vi.mock('../../lib/auth/session', () => ({ 
  requireRoleForVerifiedSession: vi.fn(),
  AuthError: class extends Error { constructor(public kind: string, public status: number) { super(kind); } }
}));

vi.mock('../../lib/rate-limit', () => ({ rateLimit: vi.fn() }));

// 2. Mock createUserClient instead of supabaseAdmin
vi.mock('../../lib/supabase-client', () => ({ 
  createUserClient: vi.fn() 
}));

// 3. Fix the cookies mock to return a valid token
vi.mock('next/headers', () => ({ 
  cookies: vi.fn().mockResolvedValue({ 
    get: vi.fn().mockReturnValue({ value: 'mock-token' }) 
  }) 
}));

describe('@security:authz — route-level integration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unauthenticated users', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/listings', { method: 'POST', body: '{}' });
    const res = await createListing(req);
    expect(res.status).toBe(401);
  });

  it('rejects users without the seller role', async () => {
    vi.mocked(getSession).mockResolvedValue({ sub: 'u1', displayName: 'A', nameType: 'nickname' });
    vi.mocked(requireRoleForVerifiedSession).mockRejectedValue(new AuthError('forbidden', 403));
    
    const req = new NextRequest('http://localhost/api/listings', { method: 'POST', body: JSON.stringify({}) });
    const res = await createListing(req);
    expect(res.status).toBe(403);
  });

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
    
    // Mock the exact chain the approve route uses
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  // Product update fails because it's a skill (simulating 0 rows / PGRST116)
                  single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
                })
              })
            })
          })
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            // Fallback fetch identifies it as an unverified skill
            single: vi.fn().mockResolvedValue({ 
              data: { id: 'l1', type: 'skill', proof_verified: false, status: 'plan_ready' }, 
              error: null 
            })
          })
        })
      })
    };
    
    vi.mocked(createUserClient).mockReturnValue(mockSupabase as never);

    const req = new NextRequest('http://localhost/api/listings/l1/approve', { method: 'POST' });
    const res = await approveListing(req, { params: { id: 'l1' } });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('must be verified');
  });
});