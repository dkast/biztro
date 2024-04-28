-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Invite" ("email", "id") SELECT "email", "id" FROM "Invite";
DROP TABLE "Invite";
ALTER TABLE "new_Invite" RENAME TO "Invite";
CREATE UNIQUE INDEX "Invite_email_key" ON "Invite"("email");
CREATE INDEX "Invite_email_idx" ON "Invite"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
