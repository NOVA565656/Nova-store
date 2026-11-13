// @security:authz
// Verifies the real authorization gate (lib/auth/session.ts), not a mock.
import { describe, it, expect } from 'vitest';
import { signSession, verifyOrThrow, requireRoleToken, AuthError } from '../../lib/auth/session';

describe('@security:authz — authorization gate', () => {
  it('rejects unauthenticated access (no token)', async () => {
    await expect(verifyOrThrow(undefined)).rejects.toMatchObject({ status: 401, kind: 'unauthorized' });
  });

  it('rejects malformed token', async () => {
    await expect(verifyOrThrow('not.a.jwt')).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects wrong role (buyer calling seller-only)', async () => {
    const token = await signSession({ sub: 'u1', role: 'buyer', displayName: 'B', nameType: 'nickname' });
    await expect(requireRoleToken(token, 'seller')).rejects.toMatchObject({ status: 403, kind: 'forbidden' });
  });

  it('accepts correct role', async () => {
    const token = await signSession({ sub: 'u2', role: 'seller', displayName: 'S', nameType: 'company' });
    const p = await requireRoleToken(token, 'seller');
    expect(p.sub).toBe('u2');
  });
});