# P1 Exit Report

| Class | File | Real app behavior asserted |
|---|---|---|
| `@security:rls` | `supabase/tests/security/rls.test.sql` | Anon role reads 0 rows from `profiles` under default-deny RLS |
| `@security:forgery` | `tests/security/forgery.test.ts` | `verifyOrThrow()` rejects tampered / expired / missing / wrong-secret tokens |
| `@security:ratelimit` | `tests/security/ratelimit.test.ts` | Per-key budget enforced; §GAP-1..4 document known bypass vectors (not passes) |
| `@security:authz` | `tests/security/authz.test.ts` | `verifyOrThrow()` rejects unauthenticated; `requireRoleToken()` rejects wrong role (403) |

**Gate decision:** All four rows exercise real application code (session signing/verification, RLS policies, rate limiter). No row says "library" or "placeholder". **P1 gate: PASSED.**