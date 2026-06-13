-- Nullify duplicate slugs before enforcing uniqueness, keeping the most recently updated row
UPDATE "Organization"
SET "slug" = NULL
WHERE "id" NOT IN (
  SELECT "id" FROM "Organization" AS o2
  WHERE o2."slug" = "Organization"."slug"
  ORDER BY o2."updatedAt" DESC
  LIMIT 1
) AND "slug" IS NOT NULL;

-- DropIndex
DROP INDEX "Organization_slug_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
