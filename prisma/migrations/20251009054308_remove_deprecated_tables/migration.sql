/*
  Warnings:

  - You are about to drop the `Customer_Removed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription_Removed` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Customer_Removed";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subscription_Removed";
PRAGMA foreign_keys=on;
