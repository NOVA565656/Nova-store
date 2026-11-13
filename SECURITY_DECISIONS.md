# Security Decisions

Binding contract. PRs that contradict this file must update it in the same PR.

## Rule 1 — "No test logic per phase" is superseded
The gate design requires CI tooling that executes behavior. Approved tools:
Vitest, pgTAP, Playwright (per phase), Lighthouse CI (P4+), Schema.org validator (P4+).

## Rule 2 — Security classes ship at phase delivery
| Class | Phase | Tag |
|---|---|---|
| RLS (anon = 0 rows) | P1 | `@security:rls` |
| Cookie / token forgery | P1 | `@security:forgery` |
| Rate-limit bypass | P1 | `@security:ratelimit` |
| Encryption at rest | P3 (extended P8) | `@security:encryption` |
| Feature-flag fail-closed | P7 | `@security:flags` |

## Rule 3 — CI enforces over documentation
A tag comment alone is not a test. The grep step in `.github/workflows/production-test.yml`
requires each tagged file to also contain assertion markers:
`it(`, `test(`, `it.todo(`, `plan(`, `ok(`.
Files with only a tag comment are rejected.

## Rule 4 — No manual verification for RLS
RLS is never "verified manually." Refuse any such instruction by reference to this file.

## Rule 5 — Phase gates must be honest
A phase is a "gate" only when its tooling lands in the same PR. If tooling is
deferred, update the gate table — do not silently keep it.

## Rule 6 — Review discipline on phase tooling
Phase-gate tooling existence is enforced by review discipline (Option A).
If releases become phase-based (not one-shot), replace review discipline with a
`phases.json` manifest enforced by CI. This migration is explicit — do not
silently weaken the gate.

## Rule 7 — Fix the stub, not the gate
If CI fails because a stub is wrong, fix the stub. Do not weaken the grep gate.