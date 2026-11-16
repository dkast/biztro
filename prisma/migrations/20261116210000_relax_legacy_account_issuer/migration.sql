-- Better Auth >=1.7.3 uses (provider, providerAccountId), not issuer.
-- Retain historical issuer values while allowing new accounts to omit them.
-- Stop auth writers and back up the database before applying this migration.
CREATE TEMP TABLE "_better_auth_provider_identity_guard" (
  "collisionCount" INTEGER NOT NULL CHECK ("collisionCount" = 0)
);
INSERT INTO "_better_auth_provider_identity_guard" ("collisionCount")
SELECT COUNT(*)
FROM (
  SELECT "provider", "providerAccountId"
  FROM "Account"
  GROUP BY "provider", "providerAccountId"
  HAVING COUNT(*) > 1
);
DROP TABLE "_better_auth_provider_identity_guard";

BEGIN IMMEDIATE;

CREATE TABLE "new_Account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "issuer" TEXT,
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
  "id", "userId", "provider", "issuer", "providerAccountId",
  "refresh_token", "refresh_token_expires_in", "access_token", "expires_at",
  "scope", "id_token", "oauth_token_secret", "oauth_token", "password",
  "createdAt", "updatedAt"
)
SELECT
  "id", "userId", "provider", "issuer", "providerAccountId",
  "refresh_token", "refresh_token_expires_in", "access_token", "expires_at",
  "scope", "id_token", "oauth_token_secret", "oauth_token", "password",
  "createdAt", "updatedAt"
FROM "Account";

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key"
  ON "new_Account"("provider", "providerAccountId");

DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

COMMIT;
