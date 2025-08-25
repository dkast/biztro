/*
  Warnings:

  - You are about to drop the column `subdomain` on the `Organization` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'BASIC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customDomain" TEXT,
    "slug" TEXT,
    "metadata" TEXT
);
INSERT INTO "new_Organization" ("banner", "createdAt", "customDomain", "description", "id", "logo", "metadata", "name", "plan", "slug", "status", "updatedAt") SELECT "banner", "createdAt", "customDomain", "description", "id", "logo", "metadata", "name", "plan", "slug", "status", "updatedAt" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");
CREATE UNIQUE INDEX "Organization_customDomain_key" ON "Organization"("customDomain");
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
