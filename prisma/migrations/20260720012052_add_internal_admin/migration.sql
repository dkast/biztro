-- AlterTable
ALTER TABLE "Session" ADD COLUMN "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "banExpires" DATETIME;
ALTER TABLE "User" ADD COLUMN "banReason" TEXT;
ALTER TABLE "User" ADD COLUMN "banned" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'user';

-- CreateTable
CREATE TABLE "InternalAdminAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "action" TEXT NOT NULL,
    "payload" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "InternalAdminAuditLog_actorId_idx" ON "InternalAdminAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "InternalAdminAuditLog_targetUserId_idx" ON "InternalAdminAuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "InternalAdminAuditLog_action_idx" ON "InternalAdminAuditLog"("action");

-- CreateIndex
CREATE INDEX "InternalAdminAuditLog_createdAt_idx" ON "InternalAdminAuditLog"("createdAt");
