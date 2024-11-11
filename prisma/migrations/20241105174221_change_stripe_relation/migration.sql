/*
  Warnings:

  - You are about to drop the column `userId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `membershipId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "stripeCustomerId" TEXT NOT NULL PRIMARY KEY,
    "membershipId" TEXT NOT NULL,
    CONSTRAINT "Customer_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("stripeCustomerId") SELECT "stripeCustomerId" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
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
    CONSTRAINT "Subscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("cancelAt", "cancelAtPeriodEnd", "canceledAt", "created", "currentPeriodEnd", "currentPeriodStart", "endedAt", "id", "metadata", "priceId", "quantity", "status", "trialEnd", "trialStart") SELECT "cancelAt", "cancelAtPeriodEnd", "canceledAt", "created", "currentPeriodEnd", "currentPeriodStart", "endedAt", "id", "metadata", "priceId", "quantity", "status", "trialEnd", "trialStart" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
