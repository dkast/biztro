-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Main',
    "description" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "tiktok" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "serviceDelivery" BOOLEAN NOT NULL DEFAULT false,
    "serviceTakeout" BOOLEAN NOT NULL DEFAULT false,
    "serviceDineIn" BOOLEAN NOT NULL DEFAULT false,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Location" ("address", "createdAt", "description", "facebook", "id", "instagram", "name", "organizationId", "phone", "tiktok", "twitter", "updatedAt", "website", "whatsapp") SELECT "address", "createdAt", "description", "facebook", "id", "instagram", "name", "organizationId", "phone", "tiktok", "twitter", "updatedAt", "website", "whatsapp" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
