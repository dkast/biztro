-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "stripeCustomerId" TEXT NOT NULL PRIMARY KEY,
    "membershipId" TEXT NOT NULL,
    CONSTRAINT "Customer_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("membershipId", "stripeCustomerId") SELECT "membershipId", "stripeCustomerId" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_membershipId_key" ON "Customer"("membershipId");
CREATE INDEX "Customer_membershipId_idx" ON "Customer"("membershipId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
