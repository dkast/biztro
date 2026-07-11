-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "priceId" TEXT,
    "quantity" INTEGER NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "cancelAt" DATETIME,
    "canceledAt" DATETIME,
    "trialStart" DATETIME,
    "trialEnd" DATETIME,
    "membershipId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Subscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("cancelAt", "cancelAtPeriodEnd", "canceledAt", "created", "currentPeriodEnd", "currentPeriodStart", "endedAt", "id", "membershipId", "metadata", "organizationId", "priceId", "quantity", "status", "trialEnd", "trialStart") SELECT "cancelAt", "cancelAtPeriodEnd", "canceledAt", "created", "currentPeriodEnd", "currentPeriodStart", "endedAt", "id", "membershipId", "metadata", "organizationId", "priceId", "quantity", "status", "trialEnd", "trialStart" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE INDEX "Subscription_membershipId_idx" ON "Subscription"("membershipId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
