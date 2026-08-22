ALTER TABLE "Organization" ADD COLUMN "acceptsCash" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organization" ADD COLUMN "acceptsCard" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organization" ADD COLUMN "acceptsTransfer" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organization" ADD COLUMN "acceptsCodi" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN "acceptsVoucher" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN "creditEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Existing organizations already support every payment method.
UPDATE "Organization"
SET
    "acceptsCodi" = true,
    "acceptsVoucher" = true;

ALTER TABLE "Payment" ADD COLUMN "origin" TEXT NOT NULL DEFAULT 'SALE';

-- Payments created by the previous receivables flow have allocations created
-- after the sale was completed. Backfill only those unambiguous movements;
-- checkout and historical LEGACY payments remain SALE.
UPDATE "Payment"
SET "origin" = 'RECEIVABLE'
WHERE EXISTS (
    SELECT 1
    FROM "PaymentAllocation" AS "PaymentAllocation"
    INNER JOIN "Sale" AS "Sale"
        ON "Sale"."id" = "PaymentAllocation"."saleId"
    WHERE "PaymentAllocation"."paymentId" = "Payment"."id"
        AND "PaymentAllocation"."createdAt" > COALESCE(
            "Sale"."completedAt",
            "Sale"."createdAt"
        )
);

UPDATE "Organization"
SET "creditEnabled" = true
WHERE "id" IN (
    SELECT "Sale"."organizationId"
    FROM "Sale"
    LEFT JOIN "PaymentAllocation"
        ON "PaymentAllocation"."saleId" = "Sale"."id"
    LEFT JOIN "Payment"
        ON "Payment"."id" = "PaymentAllocation"."paymentId"
        AND "Payment"."status" = 'ACTIVE'
    WHERE "Sale"."status" = 'COMPLETED'
        AND "Sale"."customerId" IS NOT NULL
    GROUP BY "Sale"."id"
    HAVING ROUND("Sale"."total" * 100) > COALESCE(
        SUM(
            CASE
                WHEN "Payment"."status" = 'ACTIVE'
                    THEN "PaymentAllocation"."amountMinor"
                ELSE 0
            END
        ),
        0
    )
);

CREATE INDEX "Payment_organizationId_origin_status_createdAt_idx"
ON "Payment"("organizationId", "origin", "status", "createdAt");
