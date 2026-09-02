import { readFileSync } from "node:fs"
import { DatabaseSync } from "node:sqlite"
import { fileURLToPath } from "node:url"
import { afterEach, describe, expect, it } from "vitest"

const migrationPath = fileURLToPath(
  new URL(
    "../../../prisma/migrations/20260902000000_better_auth_1_7_account_identity/migration.sql",
    import.meta.url
  )
)
const migrationSql = readFileSync(migrationPath, "utf8")

let database: DatabaseSync | undefined

afterEach(() => {
  database?.close()
  database = undefined
})

function createPopulatedV16Database() {
  database = new DatabaseSync(":memory:")
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT
    );
    CREATE TABLE "Account" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "refresh_token_expires_in" INTEGER,
      "access_token" TEXT,
      "expires_at" DATETIME,
      "scope" TEXT,
      "id_token" TEXT,
      "oauth_token_secret" TEXT,
      "oauth_token" TEXT,
      "password" TEXT,
      "createdAt" DATETIME NOT NULL,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX "Account_provider_providerAccountId_key"
      ON "Account"("provider", "providerAccountId");
    CREATE INDEX "Account_userId_idx" ON "Account"("userId");
    CREATE TABLE "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionToken" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "expires" DATETIME NOT NULL,
      "activeOrganizationId" TEXT
    );
    CREATE TABLE "Organization" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT,
      "plan" TEXT NOT NULL,
      "status" TEXT NOT NULL
    );
    CREATE TABLE "Member" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "role" TEXT NOT NULL
    );
    CREATE TABLE "Invitation" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "email" TEXT NOT NULL
    );
    CREATE TABLE "Subscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "plan" TEXT NOT NULL,
      "referenceId" TEXT NOT NULL,
      "stripeCustomerId" TEXT,
      "stripeSubscriptionId" TEXT,
      "status" TEXT
    );

    INSERT INTO "User" VALUES ('user-google', 'Returning User', 'returning@example.com');
    INSERT INTO "Account" (
      "id", "userId", "provider", "providerAccountId", "access_token",
      "scope", "id_token", "createdAt", "updatedAt"
    ) VALUES (
      'account-google', 'user-google', 'google', 'google-sub-123',
      'access-token', 'openid,email,profile', 'id-token',
      '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
    );
    UPDATE "Account" SET "refresh_token_expires_in" = 604800
    WHERE "id" = 'account-google';
    INSERT INTO "Session" VALUES (
      'session-1', 'session-token', 'user-google',
      '2026-09-10T00:00:00.000Z', 'org-1'
    );
    INSERT INTO "Organization" VALUES ('org-1', 'Biztro Test', 'biztro-test', 'PRO', 'ACTIVE');
    INSERT INTO "Member" VALUES ('member-1', 'org-1', 'user-google', 'owner');
    INSERT INTO "Subscription" VALUES (
      'subscription-1', 'PRO', 'org-1', 'cus_123', 'sub_123', 'active'
    );
  `)

  return database
}

describe("Better Auth 1.7 account identity migration", () => {
  it("preserves returning Google identity and existing session, organization, and subscription data", () => {
    const db = createPopulatedV16Database()

    db.exec(migrationSql)

    expect(
      db
        .prepare(
          `SELECT "userId", "provider", "issuer", "providerAccountId",
                  "refresh_token_expires_in" AS "refreshTokenExpiresAt"
           FROM "Account" WHERE "id" = 'account-google'`
        )
        .get()
    ).toEqual({
      userId: "user-google",
      provider: "google",
      issuer: "https://accounts.google.com",
      providerAccountId: "google-sub-123",
      refreshTokenExpiresAt: "2026-08-08T00:00:00.000Z"
    })
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM "Session"
           WHERE "sessionToken" = 'session-token' AND "activeOrganizationId" = 'org-1'`
        )
        .get()
    ).toEqual({ count: 1 })
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM pragma_table_info('Organization')
           WHERE name = 'stripeCustomerId'`
        )
        .get()
    ).toEqual({ count: 1 })
    expect(
      db
        .prepare(
          `SELECT "stripeCustomerId" FROM "Organization" WHERE "id" = 'org-1'`
        )
        .get()
    ).toEqual({ stripeCustomerId: "cus_123" })
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM "Member"
           WHERE "organizationId" = 'org-1' AND "userId" = 'user-google' AND "role" = 'owner'`
        )
        .get()
    ).toEqual({ count: 1 })
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM "Subscription"
           WHERE "referenceId" = 'org-1' AND "stripeSubscriptionId" = 'sub_123' AND "status" = 'active'`
        )
        .get()
    ).toEqual({ count: 1 })
  })

  it("enforces the issuer-scoped identity key and rejects unreviewed providers", () => {
    const db = createPopulatedV16Database()

    db.exec(migrationSql)

    expect(() =>
      db
        .prepare(
          `INSERT INTO "Account" (
            "id", "userId", "provider", "issuer", "providerAccountId", "createdAt", "updatedAt"
          ) VALUES (
            'duplicate-google', 'user-google', 'google',
            'https://accounts.google.com', 'google-sub-123',
            '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
          )`
        )
        .run()
    ).toThrow()

    const unsupportedDb = new DatabaseSync(":memory:")
    database?.close()
    database = unsupportedDb
    unsupportedDb.exec(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE "User" ("id" TEXT NOT NULL PRIMARY KEY);
      CREATE TABLE "Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "refresh_token_expires_in" INTEGER,
        "access_token" TEXT,
        "expires_at" DATETIME,
        "scope" TEXT,
        "id_token" TEXT,
        "oauth_token_secret" TEXT,
        "oauth_token" TEXT,
        "password" TEXT,
        "createdAt" DATETIME NOT NULL,
        "updatedAt" DATETIME NOT NULL
      );
      INSERT INTO "User" VALUES ('user-1');
      INSERT INTO "Account" (
        "id", "userId", "provider", "providerAccountId", "createdAt", "updatedAt"
      ) VALUES (
        'account-1', 'user-1', 'unreviewed-provider', 'subject-1',
        '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
      );
    `)

    expect(() => unsupportedDb.exec(migrationSql)).toThrow()
    expect(
      unsupportedDb
        .prepare(
          `SELECT COUNT(*) AS count FROM pragma_table_info('Account') WHERE name = 'issuer'`
        )
        .get()
    ).toEqual({ count: 0 })
    expect(unsupportedDb.prepare(`PRAGMA foreign_keys`).get()).toEqual({
      foreign_keys: 1
    })
  })

  it("leaves the v1.6 schema untouched when Stripe customer history is ambiguous", () => {
    const db = createPopulatedV16Database()
    db.exec(`
      INSERT INTO "Subscription" VALUES (
        'subscription-2', 'PRO', 'org-1', 'cus_conflict', 'sub_conflict', 'canceled'
      );
    `)

    expect(() => db.exec(migrationSql)).toThrow()
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM pragma_table_info('Account') WHERE name = 'issuer'`
        )
        .get()
    ).toEqual({ count: 0 })
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM pragma_table_info('Organization')
           WHERE name = 'stripeCustomerId'`
        )
        .get()
    ).toEqual({ count: 0 })
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM "Account" WHERE "id" = 'account-google'`
        )
        .get()
    ).toEqual({ count: 1 })
    expect(db.prepare(`PRAGMA foreign_keys`).get()).toEqual({ foreign_keys: 1 })
  })

  it("rejects a Stripe customer shared by multiple organizations", () => {
    const db = createPopulatedV16Database()
    db.exec(`
      INSERT INTO "Organization" VALUES (
        'org-2', 'Second Organization', 'second-org', 'PRO', 'ACTIVE'
      );
      INSERT INTO "Subscription" VALUES (
        'subscription-2', 'PRO', 'org-2', 'cus_123', 'sub_2', 'active'
      );
    `)

    expect(() => db.exec(migrationSql)).toThrow()
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM pragma_table_info('Account') WHERE name = 'issuer'`
        )
        .get()
    ).toEqual({ count: 0 })
    expect(
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM pragma_table_info('Organization')
           WHERE name = 'stripeCustomerId'`
        )
        .get()
    ).toEqual({ count: 0 })
    expect(db.prepare(`PRAGMA foreign_keys`).get()).toEqual({ foreign_keys: 1 })
  })
})
