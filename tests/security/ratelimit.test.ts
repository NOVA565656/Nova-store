// @security:ratelimit
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit } from '../../lib/rate-limit';
import { supabaseAdmin } from '../../lib/db';

vi.mock('../../lib/db', () => ({ 
  supabaseAdmin: { rpc: vi.fn() } 
}));

describe('@security:ratelimit — DB-backed fail-closed behavior', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows requests under the limit', async () => {
    // FIXED: Cast as never to satisfy the full PostgrestResponse type
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({ data: true, error: null } as never);
    
    const result = await rateLimit('key1', 5, 60000);
    expect(result).toBe(true);
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('check_rate_limit', {
      p_key: 'key1', p_limit: 5, p_window_seconds: 60
    });
  });

  it('blocks requests when the DB returns false', async () => {
    // FIXED: Cast as never
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({ data: false, error: null } as never);
    
    const result = await rateLimit('key2', 5, 60000);
    expect(result).toBe(false);
  });

  it('fails closed if the database throws an error', async () => {
    // FIXED: Cast the error object as never to satisfy PostgrestError
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({ data: null, error: new Error('DB Down') } as never);
    
    const result = await rateLimit('key3', 5, 60000);
    expect(result).toBe(false); 
  });
});