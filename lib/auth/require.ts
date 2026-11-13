import { cookies } from 'next/headers';
import { verifyOrThrow, AuthError, type SessionPayload } from './session';

export const SESSION_COOKIE = 'session';

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyOrThrow(token);
  } catch (e) {
    if (e instanceof AuthError) return null;
    throw e; // config / unexpected errors propagate
  }
}