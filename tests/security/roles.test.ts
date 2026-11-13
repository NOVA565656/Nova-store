// @security:authz
// Closes the last mocked seam: asserts the actual DB query shape for getUserRoles().
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db', () => ({ supabaseAdmin: { from: vi.fn() } }));

import { supabaseAdmin } from '../../lib/db';
import { getUserRoles } from '../../lib/auth/roles';

const mockFrom = vi.mocked(supabaseAdmin.from as unknown as (...args: unknown[]) => unknown);

function chain(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  return { select, eq, maybeSingle };
}

beforeEach(() => mockFrom.mockReset());

describe('@security:authz — getUserRoles DB query shape', () => {
  it('queries the profiles.roles column filtered by id', async () => {
    const { select, eq } = chain({ data: { roles: ['buyer', 'seller'] }, error: null });
    mockFrom.mockReturnValue({ select } as never);

    const roles = await getUserRoles('u1');
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith('roles');
    expect(eq).toHaveBeenCalledWith('id', 'u1');
    expect(roles).toEqual(['buyer', 'seller']);
  });

  it('returns [] when the DB returns an error', async () => {
    const { select } = chain({ data: null, error: new Error('boom') });
    mockFrom.mockReturnValue({ select } as never);
    expect(await getUserRoles('u1')).toEqual([]);
  });

  it('returns [] when the profile row is missing', async () => {
    const { select } = chain({ data: null, error: null });
    mockFrom.mockReturnValue({ select } as never);
    expect(await getUserRoles('u1')).toEqual([]);
  });
});