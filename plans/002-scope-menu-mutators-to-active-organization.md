# Plan 002: Scope menu and theme mutators to the active organization

Status: DONE
Written against commit: `147b714`
Finding: Menu and theme mutations trust object IDs or caller-supplied org IDs
Category: Security
Effort: M
Fix risk: MED
Dependencies: [001-establish-test-baseline.md](001-establish-test-baseline.md)

## Why this matters

Several authenticated menu actions mutate rows by `id` or by `organizationId` supplied by the client instead of deriving ownership from the active member/session. If a menu or theme ID leaks through URLs, logs, analytics, or a shared screenshot, an authenticated user could attempt cross-tenant writes.

Current evidence:

```ts
// src/server/actions/menu/mutations.ts:97-109
export const updateMenuName = authActionClient
  .inputSchema(z.object({ id: z.string(), name: z.string() }))
  .action(async ({ parsedInput: { id, name } }) => {
    const menu = await prisma.menu.update({
      where: { id },
      data: { name }
    })
```

```ts
// src/server/actions/menu/mutations.ts:147-166
export const updateMenuStatus = authActionClient
  .inputSchema(...)
  .action(async ({ parsedInput: { id, status, fontTheme, colorTheme, serialData } }) => {
    const menu = await prisma.$transaction(async tx => {
      const updated = await tx.menu.update({
        where: { id },
```

```ts
// src/server/actions/menu/mutations.ts:478-503
export const deleteMenu = authActionClient
  .inputSchema(z.object({ id: z.string(), organizationId: z.string() }))
  .action(async ({ parsedInput: { id, organizationId } }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { activeMenuId: true }
    })
```

```ts
// src/server/actions/menu/mutations.ts:536-570
export const duplicateMenu = authActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const sourceMenu = await prisma.menu.findUnique({
      where: { id }
    })
```

By contrast, `setActiveMenu` already shows the right pattern:

```ts
// src/server/actions/menu/mutations.ts:262-287
const currentOrg = await getCurrentOrganization()
const menu = await prisma.menu.findFirst({
  where: {
    id,
    organizationId: currentOrg.id
  },
  select: { id: true, status: true, organizationId: true }
})
```

## Repo conventions to follow

- Keep auth/organization context server-derived. Do not trust `organizationId` from client input for authorization.
- Prefer `authMemberActionClient` when a mutation requires active organization membership; it supplies `ctx.member.organizationId`.
- Continue using `updateTag` cache invalidation names already used by the action.
- Capture unexpected errors with Sentry following existing patterns.
- Do not edit `src/generated/`.

## Scope

In scope:

- `src/server/actions/menu/mutations.ts`
- New or existing tenant guard helper tests added under the test baseline from plan 001.
- Minimal schema changes to action inputs only where removing client-supplied `organizationId` is safe.

Out of scope:

- UI redesign of menu editor or theme screens.
- Prisma schema changes or migrations.
- Public menu read path behavior.
- Sales/catalog/location/media actions, covered by plans 003 and 004.

## Implementation steps

1. Convert menu/theme mutators that require membership from `authActionClient` to `authMemberActionClient`.
2. Derive `const organizationId = member.organizationId` at the top of each action and fail closed with the repo's Spanish failure shape when missing.
3. For menu mutations, fetch or update with both `id` and `organizationId`:
   - `updateMenuName`
   - `updateMenuStatus`
   - `updateMenuSerialData`
   - `revertMenuToPublished`
   - `deleteMenu`
   - `duplicateMenu`
4. For `deleteMenu`, ignore or remove the input `organizationId`. Check the active menu on the derived organization only.
5. For `duplicateMenu`, load the source menu with `findFirst({ where: { id, organizationId } })`, not `findUnique({ where: { id } })`, and create the copy in the same `organizationId`.
6. For color themes:
   - `createColorTheme`: do not accept arbitrary `organizationId` for custom themes. If `scope` is global, only allow that through an explicit, existing admin-only path; if no such path exists, STOP and report.
   - `updateColorTheme`: update only a theme where `id` and `organizationId` match the active org, unless it is a documented immutable global theme path.
   - `deleteColorTheme`: keep the active-org filter and ensure it cannot delete global themes.
7. Keep cache invalidation tags equivalent, but base organization tags on the server-derived organization ID.
8. Add tests that call the new helper/action boundary with matching and mismatched organization IDs. Mock Prisma/auth only at the boundary needed; do not require a real DB.

## Test plan

After plan 001, add tests covering:

- A foreign menu ID returns a failure and does not call `prisma.menu.update`.
- `deleteMenu` ignores a client-provided foreign `organizationId` or no longer accepts it.
- `duplicateMenu` cannot copy a menu from another organization.
- `updateColorTheme` cannot update a theme from another organization.

Prefer testing a shared helper if direct next-safe-action invocation is cumbersome. The tests must prove the SQL `where` includes the active organization ID or that a preflight ownership lookup fails closed.

## Verification

Run:

```sh
bun run test
bun run lint
bun run typecheck
```

Expected result:

- Tests include passing coverage for same-org and foreign-org menu/theme mutation attempts.
- Lint and typecheck exit 0.

## Done criteria

- No menu/theme mutation in `src/server/actions/menu/mutations.ts` performs a write by bare `id` when the row is organization-scoped.
- No menu/theme mutation trusts client-supplied `organizationId` for authorization.
- Failure messages remain user-safe and do not reveal whether a foreign ID exists.
- Existing cache invalidation still runs for successful same-org mutations.

## Escape hatches

- If a global theme admin workflow exists and is intentionally editable by non-org context, STOP and document the path before changing it.
- If Prisma rejects compound filters in `where` for update/delete, use a transaction with a scoped `findFirst` followed by the write only after ownership is confirmed. Do not fall back to bare `id` writes.

## Maintenance note

Future menu actions should start from `authMemberActionClient` and derive organization from `ctx.member`, even when the UI already has an organization ID for routing or cache tags.

## Unresolved questions

- None for regular custom themes. Global theme editing should be treated as admin-only unless existing code proves otherwise.
