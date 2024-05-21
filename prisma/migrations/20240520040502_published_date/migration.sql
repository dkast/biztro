-- AlterTable
ALTER TABLE "Menu" ADD COLUMN "publishedAt" DATETIME;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Theme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'CUSTOM',
    "themeType" TEXT NOT NULL DEFAULT 'FONT',
    "themeJSON" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT,
    CONSTRAINT "Theme_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Theme" ("createdAt", "id", "name", "organizationId", "scope", "themeJSON", "themeType", "updatedAt") SELECT "createdAt", "id", "name", "organizationId", "scope", "themeJSON", "themeType", "updatedAt" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
CREATE UNIQUE INDEX "Theme_organizationId_name_scope_key" ON "Theme"("organizationId", "name", "scope");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
