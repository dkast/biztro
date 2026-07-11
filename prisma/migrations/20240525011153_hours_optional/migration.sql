-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OpeningHours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "allDay" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "locationId" TEXT NOT NULL,
    CONSTRAINT "OpeningHours_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OpeningHours" ("allDay", "createdAt", "day", "endTime", "id", "locationId", "startTime", "updatedAt") SELECT "allDay", "createdAt", "day", "endTime", "id", "locationId", "startTime", "updatedAt" FROM "OpeningHours";
DROP TABLE "OpeningHours";
ALTER TABLE "new_OpeningHours" RENAME TO "OpeningHours";
PRAGMA foreign_key_check("OpeningHours");
PRAGMA foreign_keys=ON;
