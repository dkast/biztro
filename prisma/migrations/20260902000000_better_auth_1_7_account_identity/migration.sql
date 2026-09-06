-- Better Auth 1.7 identifies accounts by (issuer, accountId). This migration
-- must run after all 1.6 writers stop and before any 1.7 writer starts.
-- Prisma records it in _prisma_migrations; do not rerun this table rebuild
-- manually. Roll back by restoring the complete pre-cutover database backup.

-- Fail closed if the database contains a provider whose trusted issuer has not
-- been explicitly reviewed for this deployment.
CREATE TEMP TABLE "_better_auth_1_7_provider_guard" (
  "unsupportedCount" INTEGER NOT NULL CHECK ("unsupportedCount" = 0)
);
INSERT INTO "_better_auth_1_7_provider_guard" ("unsupportedCount")
SELECT COUNT(*)
FROM "Account"
WHERE "provider" NOT IN ('credential', 'google');
DROP TABLE "_better_auth_1_7_provider_guard";

-- Fail before rebuilding if the projected 1.7 identity keys would collide.
CREATE TEMP TABLE "_better_auth_1_7_collision_guard" (
  "collisionCount" INTEGER NOT NULL CHECK ("collisionCount" = 0)
);
INSERT INTO "_better_auth_1_7_collision_guard" ("collisionCount")
SELECT COUNT(*)
FROM (
  SELECT
    CASE
      WHEN "provider" = 'credential' THEN 'local:credential'
      WHEN "provider" = 'google' THEN 'https://accounts.google.com'
    END AS "projectedIssuer",
    CASE
      WHEN "provider" = 'credential' THEN "userId"
      ELSE "providerAccountId"
    END AS "projectedAccountId"
  FROM "Account"
  GROUP BY "projectedIssuer", "projectedAccountId"
  HAVING COUNT(*) > 1
);
DROP TABLE "_better_auth_1_7_collision_guard";

-- Fail before permanent DDL if one organization has conflicting historical
-- customers or one customer is shared by multiple organizations. An operator
-- must separate and assign those Stripe customers explicitly.
CREATE TEMP TABLE "_better_auth_1_7_stripe_customer_guard" (
  "ambiguousCount" INTEGER NOT NULL CHECK ("ambiguousCount" = 0)
);
INSERT INTO "_better_auth_1_7_stripe_customer_guard" ("ambiguousCount")
SELECT COUNT(*)
FROM (
  SELECT "referenceId"
  FROM "Subscription"
  WHERE "stripeCustomerId" IS NOT NULL
  GROUP BY "referenceId"
  HAVING COUNT(DISTINCT "stripeCustomerId") > 1
  UNION ALL
  SELECT "stripeCustomerId"
  FROM "Subscription"
  WHERE "stripeCustomerId" IS NOT NULL
  GROUP BY "stripeCustomerId"
  HAVING COUNT(DISTINCT "referenceId") > 1
);
DROP TABLE "_better_auth_1_7_stripe_customer_guard";

BEGIN IMMEDIATE;

CREATE TABLE "new_Account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "refresh_token_expires_in" DATETIME,
  "access_token" TEXT,
  "expires_at" DATETIME,
  "scope" TEXT,
  "id_token" TEXT,
  "oauth_token_secret" TEXT,
  "oauth_token" TEXT,
  "password" TEXT,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Account" (
  "id",
  "userId",
  "provider",
  "issuer",
  "providerAccountId",
  "refresh_token",
  "refresh_token_expires_in",
  "access_token",
  "expires_at",
  "scope",
  "id_token",
  "oauth_token_secret",
  "oauth_token",
  "password",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  "userId",
  "provider",
  CASE
    WHEN "provider" = 'credential' THEN 'local:credential'
    WHEN "provider" = 'google' THEN 'https://accounts.google.com'
  END,
  CASE
    WHEN "provider" = 'credential' THEN "userId"
    ELSE "providerAccountId"
  END,
  "refresh_token",
  CASE
    WHEN "refresh_token_expires_in" IS NULL THEN NULL
    WHEN typeof("refresh_token_expires_in") = 'integer'
      AND "refresh_token_expires_in" >= 1000000000
      THEN strftime('%Y-%m-%dT%H:%M:%fZ', "refresh_token_expires_in", 'unixepoch')
    WHEN typeof("refresh_token_expires_in") = 'integer'
      THEN strftime(
        '%Y-%m-%dT%H:%M:%fZ',
        "updatedAt",
        '+' || "refresh_token_expires_in" || ' seconds'
      )
    ELSE "refresh_token_expires_in"
  END,
  "access_token",
  "expires_at",
  "scope",
  "id_token",
  "oauth_token_secret",
  "oauth_token",
  "password",
  "createdAt",
  "updatedAt"
FROM "Account";

DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";

CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Account_issuer_providerAccountId_key" ON "Account"("issuer", "providerAccountId");

ALTER TABLE "Organization" ADD COLUMN "stripeCustomerId" TEXT;

UPDATE "Organization"
SET "stripeCustomerId" = (
  SELECT MAX("Subscription"."stripeCustomerId")
  FROM "Subscription"
  WHERE "Subscription"."referenceId" = "Organization"."id"
)
WHERE EXISTS (
  SELECT 1
  FROM "Subscription"
  WHERE "Subscription"."referenceId" = "Organization"."id"
    AND "Subscription"."stripeCustomerId" IS NOT NULL
);

CREATE INDEX "Member_organizationId_idx" ON "Member"("organizationId");
CREATE INDEX "Member_userId_idx" ON "Member"("userId");
CREATE INDEX "Invitation_organizationId_idx" ON "Invitation"("organizationId");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

COMMIT;
