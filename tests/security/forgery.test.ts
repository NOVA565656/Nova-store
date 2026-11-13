// @security:forgery
// P1: verifies real session code (lib/auth/session.ts), not the jose library in isolation.
import { describe, it, expect } from 'vitest';
import { signSession, verifyOrThrow, AuthError } from '../../lib/auth/session';

const valid = { sub: 'u1', role: 'buyer' as const, displayName: 'Test', nameType: 'nickname' as const };

describe('@security:forgery — real session verification', () => {
  it('accepts a freshly signed token', async () => {
    const token = await signSession(valid);
    const payload = await verifyOrThrow(token);
    expect(payload.sub).toBe('u1');
    expect(payload.role).toBe('buyer');
  });

  it('rejects a tampered signature', async () => {
    const token = await signSession(valid);
    const tampered = token.slice(0, -6) + 'AAAAAA';
    await expect(verifyOrThrow(tampered)).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects a missing token', async () => {
    await expect(verifyOrThrow(undefined)).rejects.toMatchObject({ status: 401 });
    await expect(verifyOrThrow('')).rejects.toMatchObject({ status: 401 });
    await expect(verifyOrThrow(null)).rejects.toMatchObject({ status: 401 });
  });

  it('rejects a token signed with a different secret', async () => {
    const { SignJWT } = await import('jose');
    const otherSecret = new TextEncoder().encode('different-secret-must-be-32-chars-min!!');
    const foreign = await new SignJWT({ sub: 'u1', role: 'seller' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
      .sign(otherSecret);
    await expect(verifyOrThrow(foreign)).rejects.toMatchObject({ status: 401 });
  });

  it('rejects an expired token', async () => {
    const { SignJWT } = await import('jose');
    const s = new TextEncoder().encode(process.env.SESSION_SECRET!);
    const expired = await new SignJWT({ sub: 'u1', role: 'buyer', displayName: 'x', nameType: 'nickname' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(s);
    await expect(verifyOrThrow(expired)).rejects.toMatchObject({ status: 401 });
  });
});