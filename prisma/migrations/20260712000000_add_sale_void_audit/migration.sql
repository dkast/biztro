-- Add audit fields without rewriting or removing historical sales.
ALTER TABLE "Sale" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE "Sale" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "Sale" ADD COLUMN "completedByUserId" TEXT;
ALTER TABLE "Sale" ADD COLUMN "voidedAt" DATETIME;
ALTER TABLE "Sale" ADD COLUMN "voidedByUserId" TEXT;
ALTER TABLE "Sale" ADD COLUMN "voidReason" TEXT;

-- All pre-existing rows were created by the original atomic completion flow.
UPDATE "Sale" SET "completedAt" = "createdAt" WHERE "completedAt" IS NULL;

CREATE INDEX "Sale_organizationId_status_createdAt_idx"
ON "Sale"("organizationId", "status", "createdAt");
