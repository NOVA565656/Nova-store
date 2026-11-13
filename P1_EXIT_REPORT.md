# P1 Exit Report (revised P1.2)

| Class | File | Real app behavior asserted | Scope |
|---|---|---|---|
| `@security:rls` | `rls.test.sql` | Anon reads 0; user A cannot select/update user B; authenticated cannot update `roles`; authenticated cannot insert profiles | Route-level integration → P2 |
| `@security:forgery` | `forgery.test.ts` | Rejects tampered/expired/missing/wrong-secret tokens; JWT identity-only | — |
| `@security:ratelimit` | `ratelimit.test.ts` | Budget enforced; §GAP-1..5 documented | Not wired to routes → P2 |
| `@security:authz` | `authz.test.ts`, `roles.test.ts` | `requireRoleForVerifiedSession()` queries `getUserRoles()`; DB query shape asserted (column, filter, error path) | End-to-end role path → P2 |

**Honest gate decision:** **PASSED for helper-level scope.** Authz DB query path deferred to P2 (integration). RLS is defense-in-depth only (Rule 10). Route-level integration is P2's gate.