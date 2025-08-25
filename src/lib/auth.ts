import { PrismaClient } from "@prisma/client"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins"

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: false },
  // Map existing NextAuth columns to Better Auth fields to avoid schema changes
  session: {
    fields: {
      expiresAt: "expires", // NextAuth `expires` -> Better Auth `expiresAt`
      token: "sessionToken" // NextAuth `sessionToken` -> Better Auth `token`
    }
  },
  account: {
    fields: {
      providerId: "provider", // NextAuth `provider` -> Better Auth `providerId`
      accountId: "providerAccountId", // NextAuth `providerAccountId` -> BA `accountId`
      refreshToken: "refresh_token", // NextAuth `refresh_token` -> BA `refreshToken`
      accessToken: "access_token", // NextAuth `access_token` -> BA `accessToken`
      accessTokenExpiresAt: "expires_at", // Now DateTime? in schema
      idToken: "id_token" // NextAuth `id_token` -> BA `idToken`
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!
    }
  },
  plugins: [
    nextCookies(),
    organization({
      schema: {
        organization: {
          // Expose selected Prisma Organization scalar fields to better-auth.
          // Assumptions: the organization plugin accepts a simple mapping of field
          // names to metadata objects describing the column name and type. If the
          // real plugin API differs, this mapping is conservative and easy to adapt.
          // Better Auth already includes: id, name, slug, logo, metadata, createdAt
          // Only declare additional/custom fields present in your Prisma model.
          additionalFields: {
            description: {
              column: "description",
              type: "string",
              nullable: true
            },
            banner: { column: "banner", type: "string", nullable: true },
            status: { column: "status", type: "string", default: "ACTIVE" },
            plan: { column: "plan", type: "string", default: "BASIC" }
            // `slug` is a built-in Better Auth field; your Prisma model uses `subdomain`.
            // Keep it as an additional field if you want both, or map via `fields` option.
            // subdomain: { column: "subdomain", type: "string", unique: true },
            // customDomain: {
            //   column: "customDomain",
            //   type: "string",
            //   nullable: true
            // },
            // updatedAt is not part of the default Better Auth organization table.
            // updatedAt: { column: "updatedAt", type: "date" }
          }
        }
      }
    })
  ]
})

// Mappings notes:
// The Prisma `Organization` model includes fields:
// id, name, description, logo, banner, status, plan, createdAt, updatedAt, subdomain, customDomain
// We expose commonly useful fields to the better-auth organization schema so the plugin
// can read/write them without changing the existing database schema.
