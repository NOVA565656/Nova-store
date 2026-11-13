import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { logAuthFail } from './log';
import { getUserRoles } from './roles';
import { env } from '@/lib/env';

function secret(): Uint8Array {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

// Rule 8: JWT carries identity only.
export type SessionPayload = JWTPayload & {
  sub: string;
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
  if (!token) {
    logAuthFail('no-token', 'verify');
    throw new AuthError('unauthorized', 401);
  }
  const key = secret(); // outside try — config errors propagate, never swallowed
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as SessionPayload;
  } catch {
    logAuthFail('invalid-token', 'verify');
    throw new AuthError('unauthorized', 401);
  }
}

/**
 * @remarks Caller MUST have verified the token via verifyOrThrow() first.
 *          This function only resolves roles from the DB and enforces the check.
 */
export async function requireRoleForVerifiedSession(
  session: SessionPayload | null,
  role: 'buyer' | 'seller',
): Promise<SessionPayload> {
  if (!session) {
    logAuthFail('no-session', 'requireRole');
    throw new AuthError('unauthorized', 401);
  }
  const roles = await getUserRoles(session.sub);
  if (!roles.includes(role)) {
    logAuthFail(`wrong-role:${role}`, 'requireRole');
    throw new AuthError('forbidden', 403);
  }
  return session;
}