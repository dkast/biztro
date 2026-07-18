-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "billingInterval" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "cancelAt" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "canceledAt" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "endedAt" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "stripeScheduleId" TEXT;

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
