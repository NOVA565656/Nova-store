// @security:authz
// P1.2: role resolved from DB via getUserRoles(); JWT carries identity only.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signSession,
  verifyOrThrow,
  requireRoleForVerifiedSession,
  AuthError,
} from '../../lib/auth/session';
import { getUserRoles } from '../../lib/auth/roles';

vi.mock('../../lib/auth/roles', () => ({ getUserRoles: vi.fn() }));
const mockRoles = vi.mocked(getUserRoles);

beforeEach(() => mockRoles.mockReset());

describe('@security:authz — DB-backed authorization gate', () => {
  it('rejects unauthenticated access (no session)', async () => {
    await expect(requireRoleForVerifiedSession(null, 'seller'))
      .rejects.toMatchObject({ status: 401, kind: 'unauthorized' });
  });

  it('rejects malformed token before role check', async () => {
    await expect(verifyOrThrow('not.a.jwt')).rejects.toBeInstanceOf(AuthError);
    expect(mockRoles).not.toHaveBeenCalled();
  });

  it('rejects wrong role (buyer calling seller-only)', async () => {
    const token = await signSession({ sub: 'u1', displayName: 'B', nameType: 'nickname' });
    const session = await verifyOrThrow(token);
    mockRoles.mockResolvedValue(['buyer']);
    await expect(requireRoleForVerifiedSession(session, 'seller'))
      .rejects.toMatchObject({ status: 403, kind: 'forbidden' });
    expect(mockRoles).toHaveBeenCalledWith('u1');
  });

  it('accepts correct role', async () => {
    const token = await signSession({ sub: 'u2', displayName: 'S', nameType: 'company' });
    const session = await verifyOrThrow(token);
    mockRoles.mockResolvedValue(['buyer', 'seller']);
    const p = await requireRoleForVerifiedSession(session, 'seller');
    expect(p.sub).toBe('u2');
  });

  it('rejects when DB returns no roles', async () => {
    const token = await signSession({ sub: 'ghost', displayName: 'G', nameType: 'nickname' });
    const session = await verifyOrThrow(token);
    mockRoles.mockResolvedValue([]);
    await expect(requireRoleForVerifiedSession(session, 'buyer'))
      .rejects.toMatchObject({ status: 403 });
  });
});