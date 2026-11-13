# Security Decisions

Binding contract. PRs that contradict this file must update it in the same PR.

## Rule 1 — "No test logic" superseded
Approved tools: Vitest, pgTAP, Playwright (per phase), Lighthouse CI (P4+), Schema.org validator (P4+).

## Rule 2 — Security classes ship at phase delivery
| Class | Phase | Tag | Status |
|---|---|---|---|
| RLS | P1 | `@security:rls` | P1.2 — includes insert-denial + roles-column denial |
| Forgery | P1 | `@security:forgery` | P1.1 |
| Rate-limit bypass | P1 | `@security:ratelimit` | P1, gaps documented |
| Authorization | P1 | `@security:authz` | P1.2 — real DB query shape tested |
| Encryption at rest | P3 | `@security:encryption` | pending |
| Feature-flag fail-closed | P7 | `@security:flags` | pending |

## Rule 3 — CI enforces over documentation
Grep requires each tagged file to contain `it(`, `test(`, `it.todo(`, `plan(`, or `ok(`. `.tsx` included.

## Rule 4 — No manual verification for RLS
Refuse any such instruction by reference to this file.

## Rule 5 — Phase gates must be honest
A phase is a "gate" only when its tooling lands in the same PR.

## Rule 6 — Review discipline on phase tooling
If releases become phase-based, replace with `phases.json` manifest enforced by CI.

## Rule 7 — Fix the stub, not the gate

## Rule 8 — DB is authz source of truth
JWT carries identity only. Role resolved from `profiles.roles` per request. Role mutation blocked by column-level revoke + trigger. **Profiles are created only by the `on_auth_user_created` trigger.** Direct INSERT by authenticated is revoked. `updated_at` is not user-writable; auto-set by trigger.

## Rule 9 — Identity via provider_user_id
OAuth callback resolves ONLY via `user_oauth(provider, provider_user_id)`. Email/name lookups prohibited. Email collision → 409; explicit link-accounts flow is P2.

## Rule 10 — RLS is defense-in-depth, not primary enforcement
App authz is enforced in `requireRoleForVerifiedSession()` via `getUserRoles()` using the **service-role client** (bypasses RLS). RLS blocks direct DB access; it is NOT the app's primary gate. **If the app ever uses a user-scoped Supabase client, RLS becomes primary — update this rule.**

## Known gaps
- **§GAP-1..4** — rate limiter normalization/trust gaps.
- **§GAP-5** — Rate limiter not wired into any route. §GAP-1..4 are theoretical until P2 endpoints call `rateLimit()`. **If P2 ships endpoints without wiring the limiter, this phase-incomplete becomes a P1 regression.**

**P0 green ≠ secure.**