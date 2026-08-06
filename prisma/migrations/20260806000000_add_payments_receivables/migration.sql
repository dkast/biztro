-- Customer accounts, immutable payment movements, and their sale allocations.
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Sale" ADD COLUMN "customerId" TEXT REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT,
    "currency" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,
    "voidedAt" DATETIME,
    "voidedByUserId" TEXT,
    "voidReason" TEXT,
    CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentAllocation_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Customer_organizationId_name_idx" ON "Customer"("organizationId", "name");
CREATE INDEX "Customer_organizationId_phone_idx" ON "Customer"("organizationId", "phone");
CREATE INDEX "Sale_organizationId_customerId_status_createdAt_idx" ON "Sale"("organizationId", "customerId", "status", "createdAt");
CREATE INDEX "Payment_organizationId_createdAt_idx" ON "Payment"("organizationId", "createdAt");
CREATE INDEX "Payment_organizationId_customerId_currency_status_createdAt_idx" ON "Payment"("organizationId", "customerId", "currency", "status", "createdAt");
CREATE INDEX "Payment_organizationId_status_createdAt_idx" ON "Payment"("organizationId", "status", "createdAt");
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_saleId_key" ON "PaymentAllocation"("paymentId", "saleId");
CREATE INDEX "PaymentAllocation_saleId_idx" ON "PaymentAllocation"("saleId");
CREATE INDEX "PaymentAllocation_paymentId_idx" ON "PaymentAllocation"("paymentId");

-- Historical sales were finalized before payment capture existed. Preserve their
-- settled state with a non-selectable LEGACY movement. Void rows stay voided.
INSERT INTO "Payment" (
    "id", "organizationId", "currency", "amountMinor", "method", "status",
    "createdAt", "createdByUserId", "voidedAt", "voidedByUserId", "voidReason"
)
SELECT
    'legacy-payment-' || "id",
    "organizationId",
    "currency",
    CAST(ROUND("total" * 100) AS INTEGER),
    'LEGACY',
    CASE WHEN "status" = 'VOID' THEN 'VOID' ELSE 'ACTIVE' END,
    COALESCE("completedAt", "createdAt"),
    "completedByUserId",
    "voidedAt",
    "voidedByUserId",
    "voidReason"
FROM "Sale";

INSERT INTO "PaymentAllocation" ("id", "paymentId", "saleId", "amountMinor", "createdAt")
SELECT
    'legacy-allocation-' || "id",
    'legacy-payment-' || "id",
    "id",
    CAST(ROUND("total" * 100) AS INTEGER),
    COALESCE("completedAt", "createdAt")
FROM "Sale";
