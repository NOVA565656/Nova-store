import { describe, it, expect } from 'vitest';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode('test-secret-min-32-chars-for-hs256!!');

async function makeToken(payload: Record<string, unknown>, expDeltaSeconds = 3600): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + expDeltaSeconds)
    .sign(SECRET);
}

describe('@security:forgery — session token forgery resistance', () => {
  it('rejects a tampered signature', async () => {
    const token = await makeToken({ sub: 'user1', role: 'buyer' });
    const tampered = token.slice(0, -6) + 'AAAAAA';
    await expect(jwtVerify(tampered, SECRET)).rejects.toThrow();
  });

  it('rejects an expired token', async () => {
    const token = await makeToken({ sub: 'user1', role: 'buyer' }, -10);
    await expect(jwtVerify(token, SECRET)).rejects.toThrow();
  });

  it('rejects a missing token', async () => {
    await expect(jwtVerify('', SECRET)).rejects.toThrow();
  });

  it('rejects a token signed with a different secret', async () => {
    const otherSecret = new TextEncoder().encode('different-secret-32-chars-min-here');
    const token = await makeToken({ sub: 'user1', role: 'seller' });
    await expect(jwtVerify(token, otherSecret)).rejects.toThrow();
  });
});