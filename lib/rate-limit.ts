// Minimal in-memory rate limiter for Phase 0.
// P1 replaces the storage backend with a DB-backed implementation.
// Interface is stable; @security:ratelimit tests must not change.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export function _reset(): void {
  buckets.clear();
}