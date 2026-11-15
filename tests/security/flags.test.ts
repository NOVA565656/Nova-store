// @security:flags
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isFeatureEnabled } from '../../lib/flags';
import { supabaseAdmin } from '../../lib/db';

vi.mock('../../lib/db', () => ({ 
  supabaseAdmin: { 
    from: vi.fn() 
  } 
}));

describe('@security:flags — fail-closed behavior', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns false if the database throws (fail-closed)', async () => {
    // Force a database error
    vi.mocked(supabaseAdmin.from).mockImplementation(() => {
      throw new Error('DB Connection Lost');
    });

    const result = await isFeatureEnabled('messaging', 'user-123');
    expect(result).toBe(false);
  });

  it('returns false if the global flag does not exist', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as never);

    const result = await isFeatureEnabled('unknown_feature');
    expect(result).toBe(false);
  });

  it('prioritizes user override over global default', async () => {
    const mockFrom = vi.mocked(supabaseAdmin.from);
    
    // Mock User Override (false)
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { is_enabled: false }, error: null })
          })
        })
      })
    } as never);

    // Global default would be true, but user override wins
    const result = await isFeatureEnabled('messaging', 'user-123');
    expect(result).toBe(false);
  });
});