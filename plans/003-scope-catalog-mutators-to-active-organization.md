# Plan 003: Scope catalog mutators to the active organization

Status: DONE
Written against commit: `147b714`
Finding: Catalog mutations update products, categories, variants, and bulk selections without active-org scoping
Category: Security
Effort: M/L
Fix risk: MED
Dependencies: [001-establish-test-baseline.md](001-establish-test-baseline.md)

## Why this matters

Catalog data is core tenant data. Many product/category/variant actions already use `authMemberActionClient`, but then ignore `ctx.member.organizationId` and write by object IDs from client input. This creates an IDOR risk across restaurants and can also sync the wrong organization's published menu after a foreign write.

Current evidence:

```ts
// src/server/actions/item/mutations.ts:499-523
export const updateItem = authMemberActionClient
  .inputSchema(menuItemSchema)
  .action(async ({ parsedInput: { id, name, organizationId, variants } }) => {
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        variants: {
          upsert: variants.map(variant => ({
            where: { id: variant.id },
```

```ts
// src/server/actions/item/mutations.ts:664-700
export const bulkUpdateItems = authMemberActionClient
...
await prisma.menuItem.update({
  where: { id: itemId },
  data: {
    variants: {
      upsert: item.variants.map(variant => ({
        where: { id: variant.id },
```

```ts
// src/server/actions/item/mutations.ts:781-805
export const deleteItem = authMemberActionClient
  .inputSchema(z.object({ id: z.string(), organizationId: z.string() }))
...
const item = await prisma.menuItem.findUnique({ where: { id } })
...
await prisma.menuItem.delete({ where: { id } })
```

```ts
// src/server/actions/item/mutations.ts:894-988
export const updateCategory = authMemberActionClient
...
const category = await prisma.category.update({ where: { id }, data: { name } })
...
const items = await prisma.menuItem.findMany({ where: { categoryId: id } })
await prisma.category.delete({ where: { id } })
```

```ts
// src/server/actions/item/mutations.ts:1023-1084
export const createVariant = authMemberActionClient
...
const variant = await prisma.variant.create({ data: { name, price, menuItemId } })
...
await prisma.variant.delete({ where: { id } })
```

```ts
// src/server/actions/item/mutations.ts:1114-1250
export const bulkUpdateCategory = authMemberActionClient
...
await prisma.menuItem.updateMany({ where: { id: { in: ids } }, data: { categoryId } })
...
export const bulkDeleteItems = authMemberActionClient
...
const items = await prisma.menuItem.findMany({ where: { id: { in: ids } } })
...
export const bulkToggleFeature = authMemberActionClient
...
await prisma.menuItem.updateMany({ where: { id: { in: ids } }, data: { featured } })
```

## Repo conventions to follow

- Use `authMemberActionClient` context as the source of truth for organization membership.
- Server-side Pro gating remains through `isProMember()` where already present.
- Keep action result shapes `{ success: ... }` and `{ failure: { reason } }`.
- Use Sentry for unexpected errors.
- Keep `executeMenuSyncWithPreference` calls, but pass the server-derived organization ID only.

## Scope

In scope:

- `src/server/actions/item/mutations.ts`
- Tests for catalog ownership guard behavior.
- Minor input-schema cleanup to stop accepting authorization-only `organizationId` values from clients.

Out of scope:

- `src/server/actions/item/translations.ts` unless tests reveal the same concrete issue there. If found, document it as a follow-up rather than expanding this plan silently.
- UI copy/design changes.
- R2 media route, covered by plan 004.
- Prisma schema changes.

## Implementation steps

1. At the start of each affected action, derive `const organizationId = member.organizationId` from `ctx.member`. If missing, return the existing Spanish failure message.
2. Stop using `parsedInput.organizationId` for authorization or sync. Remove it from schemas where callers can be updated safely; otherwise ignore it and add a TODO-free server-derived replacement.
3. For `updateItem`:
   - First load the item with `findFirst({ where: { id, organizationId } })`.
   - Verify `categoryId` is either empty/null or belongs to the same organization.
   - Verify every existing `variant.id` being updated belongs to the scoped item.
   - Then perform the update.
4. For `bulkUpdateItems`, fetch all target item IDs scoped to `organizationId` before the loop. Fail or mark failed for IDs not owned by the active org without writing them.
5. For `deleteItem` and `bulkDeleteItems`, fetch items with `{ id: { in: ids }, organizationId }` before deleting images. Delete only scoped items. Never delete R2 keys for foreign items.
6. For categories:
   - `updateCategory`: update with active-org ownership confirmed.
   - `deleteCategory`: check associated items with both `categoryId` and `organizationId`; delete the category only if it belongs to the active org.
   - When assigning a category in bulk, ensure `categoryId` belongs to the active org unless clearing the category.
7. For variants:
   - `createVariant`: verify `menuItemId` belongs to the active org before creating.
   - `deleteVariant`: verify the variant's `menuItem.organizationId` matches active org before deleting.
8. For bulk category/feature updates, include `organizationId` in `updateMany.where`.
9. Add tests for at least one single-item action, one category action, one variant action, and one bulk action.

## Test plan

Add tests after plan 001:

- `updateItem` with a foreign item ID returns failure and does not call `prisma.menuItem.update`.
- `deleteItem` with a foreign item ID does not send `DeleteObjectCommand`.
- `bulkUpdateCategory` only updates IDs scoped to the active organization and refuses a foreign `categoryId`.
- `createVariant` refuses a `menuItemId` owned by another organization.

Use mocks/stubs for Prisma and R2. Do not require real AWS/R2 credentials or a real database.

## Verification

Run:

```sh
bun run test
bun run lint
bun run typecheck
```

Expected result:

- Tenant-guard regression tests pass.
- Lint and typecheck exit 0.

## Done criteria

- Every catalog write in `src/server/actions/item/mutations.ts` is scoped to `ctx.member.organizationId` or explicitly operates only on non-tenant data.
- No catalog write uses a client-provided `organizationId` as proof of authorization.
- Foreign IDs fail closed without revealing whether the foreign row exists.
- Bulk actions cannot partially mutate foreign rows.
- Published-menu sync receives the active organization ID, not a client value.

## Escape hatches

- If direct action tests are too brittle because of next-safe-action internals, extract pure ownership/where-builder helpers and test those, then keep action code as a thin caller of the helpers.
- If fixing all catalog mutators in one PR becomes too large, STOP after product item mutations and split categories/variants/bulk actions into follow-up PRs. Do not ship a partial fix without marking remaining actions in this plan.

## Maintenance note

Catalog screens may still need organization IDs for cache keys or routing, but those values must never authorize writes. Treat all client organization IDs as hints only.

## Unresolved questions

- None.
