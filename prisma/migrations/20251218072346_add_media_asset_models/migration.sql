-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "scope" TEXT,
    "bytes" INTEGER,
    "contentType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "deletedAt" DATETIME,
    "unattachedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaAsset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaUsage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "imageAssetId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "organizationId" TEXT NOT NULL,
    "allergens" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    CONSTRAINT "MenuItem_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("allergens", "categoryId", "createdAt", "currency", "description", "featured", "id", "image", "name", "organizationId", "status", "updatedAt") SELECT "allergens", "categoryId", "createdAt", "currency", "description", "featured", "id", "image", "name", "organizationId", "status", "updatedAt" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE UNIQUE INDEX "MenuItem_organizationId_name_key" ON "MenuItem"("organizationId", "name");
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
    "slug" TEXT,
    "metadata" TEXT,
    CONSTRAINT "Organization_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Organization_bannerAssetId_fkey" FOREIGN KEY ("bannerAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Organization" ("banner", "createdAt", "customDomain", "description", "id", "logo", "metadata", "name", "plan", "slug", "status", "updatedAt") SELECT "banner", "createdAt", "customDomain", "description", "id", "logo", "metadata", "name", "plan", "slug", "status", "updatedAt" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
CREATE UNIQUE INDEX "Organization_customDomain_key" ON "Organization"("customDomain");
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_organizationId_idx" ON "MediaAsset"("organizationId");

-- CreateIndex
CREATE INDEX "MediaAsset_storageKey_idx" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaUsage_entityType_entityId_idx" ON "MediaUsage"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaUsage_assetId_entityType_entityId_field_key" ON "MediaUsage"("assetId", "entityType", "entityId", "field");
