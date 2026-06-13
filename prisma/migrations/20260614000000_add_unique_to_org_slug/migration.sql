-- Nullify duplicate slugs before enforcing uniqueness using a CTE,
-- keeping the most recently updated row for each slug value
WITH duplicates AS (
  SELECT "id",
         ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "updatedAt" DESC) AS rn
  FROM "Organization"
  WHERE "slug" IS NOT NULL
)
UPDATE "Organization"
SET "slug" = NULL
WHERE "id" IN (SELECT "id" FROM duplicates WHERE rn > 1);

-- DropIndex
DROP INDEX "Organization_slug_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
