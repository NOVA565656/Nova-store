import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set (>=32 chars)');
  return new TextEncoder().encode(s);
}

export type SessionPayload = JWTPayload & {
  sub: string;
  role: 'buyer' | 'seller';
  displayName: string;
  nameType: 'nickname' | 'company';
  guest?: boolean;
};

export class AuthError extends Error {
  constructor(public kind: 'unauthorized' | 'forbidden', public status: 401 | 403) {
    super(kind);
  }
}

const TTL_SECONDS = 60 * 60 * 24 * 7;

export async function signSession(p: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(p)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + TTL_SECONDS)
    .sign(secret());
}

export async function verifyOrThrow(token: string | undefined | null): Promise<SessionPayload> {
  if (!token) throw new AuthError('unauthorized', 401);
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as SessionPayload;
  } catch {
    throw new AuthError('unauthorized', 401);
  }
}

export async function requireRoleToken(
  token: string | undefined | null,
  role: 'buyer' | 'seller',
): Promise<SessionPayload> {
  const s = await verifyOrThrow(token);
  if (s.role !== role) throw new AuthError('forbidden', 403);
  return s;
}