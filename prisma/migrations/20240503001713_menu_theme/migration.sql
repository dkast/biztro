-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "serialData" TEXT,
    "publishedData" TEXT,
    "fontTheme" TEXT NOT NULL DEFAULT 'DEFAULT',
    "colorTheme" TEXT NOT NULL DEFAULT 'DEFAULT',
    CONSTRAINT "Menu_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("createdAt", "description", "id", "name", "organizationId", "publishedData", "serialData", "status", "updatedAt") SELECT "createdAt", "description", "id", "name", "organizationId", "publishedData", "serialData", "status", "updatedAt" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
