// @security:ratelimit
import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, _reset } from '../../lib/rate-limit';

describe('@security:ratelimit — budget enforcement', () => {
  beforeEach(() => _reset());

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) expect(rateLimit('k1', 5, 60_000)).toBe(true);
  });

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 5; i++) rateLimit('k1', 5, 60_000);
    expect(rateLimit('k1', 5, 60_000)).toBe(false);
  });

  it('isolates buckets by key', () => {
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

// The four tests below DOCUMENT current weaknesses.
// Fixing the limiter will make them fail — that is the signal
// to remove the corresponding §GAP entries from SECURITY_DECISIONS.md.
describe('@security:ratelimit — bypass matrix (KNOWN GAPS, see SECURITY_DECISIONS.md)', () => {
  beforeEach(() => _reset());

  it('DOCUMENTS GAP §GAP-1: email case variation creates a new bucket', () => {
    for (let i = 0; i < 5; i++) rateLimit('User@Example.com', 5, 60_000);
    expect(rateLimit('user@example.com', 5, 60_000)).toBe(true);
  });

  it('DOCUMENTS GAP §GAP-2: IPv6 notation variants create new buckets', () => {
    for (let i = 0; i < 5; i++) rateLimit('::1', 5, 60_000);
    expect(rateLimit('0:0:0:0:0:0:0:1', 5, 60_000)).toBe(true);
  });

  it('DOCUMENTS GAP §GAP-3: unicode email normalization variants bypass', () => {
    for (let i = 0; i < 5; i++) rateLimit('café@example.com', 5, 60_000);
    expect(rateLimit('cafe\u0301@example.com', 5, 60_000)).toBe(true);
  });

  it('DOCUMENTS GAP §GAP-4: X-Forwarded-For is trusted as-is', () => {
    for (let i = 0; i < 5; i++) rateLimit('1.2.3.4', 5, 60_000);
    expect(rateLimit('5.6.7.8', 5, 60_000)).toBe(true);
  });
});