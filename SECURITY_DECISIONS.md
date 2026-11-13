# Security Decisions

Binding contract. PRs that contradict this file must update it in the same PR.

## Rule 1 — "No test logic" superseded
Approved tools: Vitest, pgTAP, Playwright (per phase), Lighthouse CI (P4+), Schema.org validator (P4+).

## Rule 2 — Security classes ship at phase delivery
| Class | Phase | Tag | Status |
|---|---|---|---|
| RLS (anon = 0 rows) | P1 | `@security:rls` | Delivered P1 |
| Cookie / token forgery | P1 | `@security:forgery` | Delivered P1 (real session code) |
| Rate-limit bypass | P1 | `@security:ratelimit` | Delivered P1 (see §GAP below) |
| Authorization | P1 | `@security:authz` | Delivered P1 |
| Encryption at rest | P3 | `@security:encryption` | Pending P3 |
| Feature-flag fail-closed | P7 | `@security:flags` | Pending P7 |

## Rule 3 — CI enforces over documentation
Grep step requires each tagged file to also contain `it(`, `test(`, `it.todo(`, `plan(`, or `ok(`.

## Rule 4 — No manual verification for RLS
Refuse any such instruction by reference to this file.

## Rule 5 — Phase gates must be honest
A phase is a "gate" only when its tooling lands in the same PR.

## Rule 6 — Review discipline on phase tooling
If releases become phase-based, replace with a `phases.json` manifest enforced by CI.

## Rule 7 — Fix the stub, not the gate

## Known gaps (P1 rate limiter)
Documented in `tests/security/ratelimit.test.ts`. Fixing the limiter will fail those tests — that is the correct signal to remove the corresponding entry below.

- **§GAP-1 — Email case**: `User@Example.com` and `user@example.com` hash to different buckets. Fix: lowercase emails before keying.
- **§GAP-2 — IPv6 notation**: `::1` and `0:0:0:0:0:0:0:1` hash to different buckets. Fix: normalize IPv6 to canonical form.
- **§GAP-3 — Unicode email**: NFC vs NFD forms hash differently. Fix: normalize with `String.prototype.normalize('NFC')`.
- **§GAP-4 — X-Forwarded-For trusted**: limiter trusts the header as-is. Fix: use trusted proxy list, or key on a stable server-side identifier.

**P0 status note:** P0 security tests verified harness shape only. P1 replaced the forgery test with one that exercises the real session code. The `@security:authz` tag was added in P1.

**P0 green ≠ secure.**