-- RedefineTables
PRAGMA defer_foreign_keys = ON;
PRAGMA foreign_keys = OFF;
CREATE TABLE "new_Organization" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "logo" TEXT,
  "logoAssetId" TEXT,
  "banner" TEXT,
  "bannerAssetId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "plan" TEXT NOT NULL DEFAULT 'BASIC',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "customDomain" TEXT,
  "activeMenuId" TEXT,
  "slug" TEXT,
  "metadata" TEXT,
  CONSTRAINT "Organization_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "MediaAsset" ("id") ON DELETE
  SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Organization_bannerAssetId_fkey" FOREIGN KEY ("bannerAssetId") REFERENCES "MediaAsset" ("id") ON DELETE
  SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Organization_activeMenuId_fkey" FOREIGN KEY ("activeMenuId") REFERENCES "Menu" ("id") ON DELETE
  SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Organization" (
    "banner",
    "bannerAssetId",
    "createdAt",
    "customDomain",
    "description",
    "id",
    "logo",
    "logoAssetId",
    "metadata",
    "name",
    "plan",
    "slug",
    "status",
    "updatedAt"
  )
SELECT "banner",
  "bannerAssetId",
  "createdAt",
  "customDomain",
  "description",
  "id",
  "logo",
  "logoAssetId",
  "metadata",
  "name",
  "plan",
  "slug",
  "status",
  "updatedAt"
FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization"
  RENAME TO "Organization";
UPDATE "Organization"
SET "activeMenuId" = (
    SELECT "id"
    FROM "Menu"
    WHERE "Menu"."organizationId" = "Organization"."id"
      AND "Menu"."status" = 'PUBLISHED'
    ORDER BY "Menu"."publishedAt" DESC,
      "Menu"."updatedAt" DESC
    LIMIT 1
  );
CREATE UNIQUE INDEX "Organization_customDomain_key" ON "Organization"("customDomain");
CREATE UNIQUE INDEX "Organization_activeMenuId_key" ON "Organization"("activeMenuId");
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");
PRAGMA foreign_keys = ON;
PRAGMA defer_foreign_keys = OFF;
-- CreateIndex
CREATE INDEX "Menu_organizationId_status_publishedAt_idx" ON "Menu"("organizationId", "status", "publishedAt");