# Plan 004: Scope location and media upload mutators

Status: DONE
Written against commit: `147b714`
Finding: Location and media upload mutators lack complete ownership and input checks
Category: Security
Effort: M
Fix risk: MED
Dependencies: [001-establish-test-baseline.md](001-establish-test-baseline.md)

## Why this matters

Location data controls restaurant public details and opening hours. Media upload signing controls write access to R2-backed assets and immediately updates organization/menu item records. Both surfaces derive the active member in some places, but still mutate by unscoped object IDs or trust client-provided upload metadata.

Current evidence:

```ts
// src/server/actions/location/mutations.ts:113-141
export const updateLocation = authMemberActionClient
...
const organizationId = member.organizationId
const location = await prisma.location.update({
  where: { id },
  data: { ... }
})
```

```ts
// src/server/actions/location/mutations.ts:184-190
export const deleteLocation = authActionClient
...
await prisma.location.delete({
  where: { id }
})
```

```ts
// src/server/actions/location/mutations.ts:222-253
export const updateHours = authMemberActionClient
...
await prisma.openingHours.deleteMany({
  where: { locationId }
})

const hours = await prisma.openingHours.createMany({
  data: items.map(item => ({ locationId, ... }))
})
```

```ts
// src/app/api/file/route.ts:30-42
export async function POST(req: NextRequest) {
  const { organizationId: requestedOrganizationId, imageType, objectId, contentType } = await req.json()
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
  }
```

```ts
// src/app/api/file/route.ts:100-110
case ImageType.MENUITEM:
  if (!objectId) return new NextResponse("Menu item id is required", ...)
  storageKey = `orgs/${organizationId}/menu-items/${objectId}/image`
  entityType = MediaUsageEntityType.MENU_ITEM
  entityId = objectId
```

```ts
// src/app/api/file/route.ts:179-182
new PutObjectCommand({
  Bucket: env.R2_BUCKET_NAME,
  Key: storageKey,
  ContentType: contentType as string
})
```

```ts
// src/app/api/file/route.ts:246-249
case ImageType.MENUITEM:
  await tx.menuItem.update({
    where: { id: objectId as string },
```

Supported upload MIME types already exist but are not used by the route:

```ts
// src/lib/types/media.ts:172-177
export const SUPPORTED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp"
] as const
```

## Repo conventions to follow

- Active organization must come from Better Auth active member/session, not request JSON.
- Use `authMemberActionClient` for server actions that need membership context.
- Keep Spanish user-facing failure messages consistent with neighboring actions.
- Use existing media types from `src/lib/types/media.ts`.
- Do not log secrets, signed URLs, or R2 credentials.

## Scope

In scope:

- `src/server/actions/location/mutations.ts`
- `src/app/api/file/route.ts`
- Tests for ownership checks and MIME validation.

Out of scope:

- Media gallery redesign.
- Changing R2 bucket policy or Cloudflare infrastructure.
- Adding virus scanning or image transcoding.
- Prisma schema changes.

## Implementation steps

1. Convert `deleteLocation` from `authActionClient` to `authMemberActionClient`.
2. In all location actions, derive `organizationId` from `ctx.member`.
3. For `updateLocation`, update only after confirming the location belongs to `organizationId`. Use a scoped `findFirst` preflight or a compound `where` filter if supported.
4. For `deleteLocation`, delete only a location belonging to `organizationId`. Return the same generic not-found/unauthorized failure for missing and foreign IDs.
5. For `updateHours`, first verify `locationId` belongs to `organizationId`; then delete/create hours. Keep the delete/create inside a transaction so a failure cannot leave a location with no hours.
6. In `src/app/api/file/route.ts`, validate the JSON body with Zod instead of destructuring unchecked `await req.json()`.
7. Validate `contentType` against the appropriate allowed set:
   - For `ImageType.LOGO`, `BANNER`, `MENUITEM`, and `MENU_BACKGROUND`, allow only image MIME types (`image/png`, `image/jpeg`, `image/webp`).
   - Do not allow `application/pdf` in this route unless this route truly supports PDF storage; PDF belongs to menu import validation, not image upload signing.
8. For `ImageType.MENUITEM`, verify `objectId` is a menu item in the active organization before generating the signed URL and before `tx.menuItem.update`.
9. For `ImageType.MENU_BACKGROUND`, verify `objectId` is a menu in the active organization before issuing a background storage key.
10. Consider replacing `Access-Control-Allow-Origin: "*"` with a same-origin response unless a documented cross-origin direct-upload flow requires it. If cross-origin is required, restrict to configured trusted origins rather than wildcard.
11. Add tests for foreign location IDs, foreign menu-item upload IDs, and unsupported MIME types.

## Test plan

Add tests after plan 001:

- `updateHours` with a foreign `locationId` does not call `openingHours.deleteMany`.
- `deleteLocation` with a foreign ID does not call `location.delete`.
- File route rejects unsupported image MIME types before calling `getSignedUrl`.
- File route rejects a foreign `MENUITEM` `objectId` before creating/updating `MediaAsset`.

Mock Prisma, Better Auth active member lookup, and S3 signing. Do not call real R2.

## Verification

Run:

```sh
bun run test
bun run lint
bun run typecheck
```

Expected result:

- Location and upload authorization tests pass.
- Lint and typecheck exit 0.

## Done criteria

- Location updates, deletes, and hour replacement are scoped to active organization membership.
- Media upload signing verifies both active organization and target object ownership.
- Upload MIME type is validated server-side.
- No signed URL is generated for invalid, foreign, or unsupported upload requests.
- The route does not expose secrets or signed URLs in logs.

## Escape hatches

- If the upload route is intentionally cross-origin for a separate app, STOP before changing CORS and document the trusted-origin source. Still implement ownership and MIME checks.
- If R2 direct-upload clients depend on `application/pdf` through this route, STOP and split PDF import/upload behavior into a separate validated path rather than weakening image validation.

## Maintenance note

Any future media scope that references an entity ID should add an ownership lookup before generating the deterministic storage key.

## Unresolved questions

- Whether wildcard CORS is required for any deployed client. Default to same-origin or configured trusted origins unless code/docs prove otherwise.
