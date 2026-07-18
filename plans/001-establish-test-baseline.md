# Plan 001: Establish a mutation-focused test baseline

Status: DONE
Written against commit: `147b714`
Finding: No automated test runner or regression suite
Category: Test coverage / DX
Effort: M
Fix risk: MED
Dependencies: none

## Why this matters

Biztro has high-risk server-side mutation surfaces for tenant-scoped restaurant data, media uploads, sales, billing, auth, and AI imports. Today the repo has lint and typecheck scripts, but no first-party test command or committed test files. The next security plans need a small automated regression harness so executors can prove cross-tenant access stays blocked.

Current evidence:

```json
// package.json:10-14
"lint": "eslint .",
"start": "next start",
"format": "prettier \"src/**/*.{ts,tsx,js,jsx,css,json}\" --write --config prettier.config.mjs",
"lint:fix": "eslint --fix \"src/**/*.{ts,tsx,js,jsx}\"",
"typecheck": "tsc --project ./tsconfig.json",
```

Repo search during the audit found no `__tests__`, `*.test.*`, `*.spec.*`, Playwright, Vitest, Jest, or Cypress files.

## Repo conventions to follow

- Use Bun scripts from `package.json`; do not introduce npm/yarn/pnpm commands.
- Keep TypeScript strict and avoid `as any`.
- Server mutations use `next-safe-action` clients from `src/lib/safe-actions.ts`.
- Domain types live under `src/lib/types/*`; do not add test-only domain types there unless shared by production code.
- Prefer minimal, targeted changes over broad refactors.

Existing action pattern to model:

```ts
// src/lib/safe-actions.ts:9-31
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    Sentry.captureException(e)
    const log = new Logger()
    log.error("Error in safe action", e)
    log.flush()
  }
})

export const authMemberActionClient = authActionClient.use(async ({ next }) => {
  const member = await getCurrentMembership()
  if (!member?.user) redirect("/login")
  return next({ ctx: { member } })
})
```

## Scope

In scope:

- Add one test runner and one `bun run test` script.
- Add a small test setup that can exercise pure authorization helpers and mutation guard helpers without a real Turso database.
- Add the first characterization tests for tenant ownership guard behavior that later plans can reuse.
- Document the test command in `README.md` only if the new command is not obvious from `package.json`.

Out of scope:

- Full end-to-end browser coverage.
- Spinning up Turso or Stripe in tests.
- Rewriting server actions as part of the baseline.
- Changing Prisma schema or generated client output.

## Implementation steps

1. Pick a test runner compatible with Bun and this TypeScript stack. Prefer Vitest because it supports ESM and is common for server-action unit tests.
2. Add the minimum dev dependency and scripts:
   - `test`: runs the unit suite once.
   - Optionally `test:watch`: local convenience only if it does not slow CI or confuse the baseline.
3. Add a config file only if needed for path aliases (`@/*`) and TS/ESM. Keep it minimal.
4. Create a test directory pattern that will be reused by later plans, for example `src/server/actions/__tests__/` or co-located `*.test.ts` files.
5. Extract or add a tiny pure helper for tenant ownership decisions only if needed by the first tests. Do not refactor production mutations yet; this plan is infrastructure-first.
6. Add one or two tests that demonstrate the desired security invariant:
   - current organization ID matches target organization ID -> allowed.
   - current organization ID missing or mismatched -> denied.
7. Ensure the new test command does not require real `.env` secrets. If imports pull in `src/env.mjs`, restructure the test target to avoid loading env-dependent modules rather than setting fake production secrets in source.

## Test plan

Add tests that are intentionally small and stable. Suggested starting file:

```ts
// src/server/actions/__tests__/tenant-ownership.test.ts
import { describe, expect, it } from "vitest"

import { isSameOrganization } from "../tenant-guards"

describe("tenant ownership guards", () => {
  it("allows matching organization IDs", () => {
    expect(isSameOrganization("org_a", "org_a")).toBe(true)
  })

  it("denies missing or mismatched organization IDs", () => {
    expect(isSameOrganization(undefined, "org_a")).toBe(false)
    expect(isSameOrganization("org_b", "org_a")).toBe(false)
  })
})
```

The helper name/path is illustrative. If a better existing helper is found, reuse it instead.

## Verification

Run:

```sh
bun run test
bun run lint
bun run typecheck
```

Expected result:

- `bun run test` exits 0 and reports the new tests passing.
- `bun run lint` exits 0.
- `bun run typecheck` exits 0.

## Done criteria

- `package.json` has a `test` script.
- The repo has at least one committed test file.
- Tests do not require external services, real secrets, local Turso, Stripe, R2, Sentry, or AI Gateway.
- Later security plans can add tests without choosing another runner.

## Escape hatches

- If adding Vitest causes dependency or ESM conflicts, STOP and report the exact error plus one alternative runner proposal. Do not add a second runner in the same pass.
- If tests require importing modules that validate real env variables, STOP and extract a pure helper boundary instead of adding fake secrets to source.

## Maintenance note

Keep the baseline fast. The purpose is to make security and mutation regressions cheap to test, not to introduce a slow suite that maintainers avoid running.

## Unresolved questions

- None for the executor. Default to Vitest unless it fails for a concrete repo-specific reason.
