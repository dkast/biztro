-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "paymentTiming" TEXT NOT NULL,
    "kitchenStatus" TEXT NOT NULL DEFAULT 'NEW',
    "orderType" TEXT NOT NULL DEFAULT 'DINE_IN',
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "total" REAL NOT NULL,
    "label" TEXT,
    "notes" TEXT,
    "requestId" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preparingAt" DATETIME,
    "readyAt" DATETIME,
    "settledAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "cancelledByUserId" TEXT,
    "cancellationAcknowledgedAt" DATETIME,
    "createdByUserId" TEXT,
    "saleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "unitPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- AlterTable
-- Additive column only; existing organizations keep the current pay-first flow.
ALTER TABLE "Organization" ADD COLUMN "paymentTiming" TEXT NOT NULL DEFAULT 'PAY_FIRST';

-- CreateIndex
CREATE UNIQUE INDEX "Order_saleId_key" ON "Order"("saleId");

-- CreateIndex
CREATE INDEX "Order_organizationId_kitchenStatus_submittedAt_idx" ON "Order"("organizationId", "kitchenStatus", "submittedAt");

-- CreateIndex
CREATE INDEX "Order_organizationId_status_submittedAt_idx" ON "Order"("organizationId", "status", "submittedAt");

-- CreateIndex
CREATE INDEX "Order_organizationId_kitchenStatus_readyAt_idx" ON "Order"("organizationId", "kitchenStatus", "readyAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_organizationId_number_key" ON "Order"("organizationId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Order_organizationId_requestId_key" ON "Order"("organizationId", "requestId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

