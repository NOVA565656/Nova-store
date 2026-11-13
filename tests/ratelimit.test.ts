import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, _reset } from '../../lib/rate-limit';

describe('@security:ratelimit — rate-limit bypass resistance', () => {
  beforeEach(() => _reset());

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit('k1', 5, 60_000)).toBe(true);
    }
  });

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 5; i++) rateLimit('k1', 5, 60_000);
    expect(rateLimit('k1', 5, 60_000)).toBe(false);
  });

  it('isolates buckets by key (no cross-key bypass)', () => {
    for (let i = 0; i < 5; i++) rateLimit('k1', 5, 60_000);
    expect(rateLimit('k2', 5, 60_000)).toBe(true);
  });

  it('resets after the window expires', async () => {
    for (let i = 0; i < 5; i++) rateLimit('k1', 5, 50);
    expect(rateLimit('k1', 5, 50)).toBe(false);
    await new Promise((r) => setTimeout(r, 60));
    expect(rateLimit('k1', 5, 50)).toBe(true);
  });
});