/*
  Warnings:

  - A unique constraint covering the columns `[membershipId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_membershipId_key" ON "Customer"("membershipId");
