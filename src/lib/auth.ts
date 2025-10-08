import { stripe } from "@better-auth/stripe"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins"
import Stripe from "stripe"

import { getActiveOrganization } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { getBaseUrl, sendOrganizationInvitation } from "@/lib/utils"

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil"
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  // Adjust trusted origins for your deployment
  trustedOrigins: [
    "https://biztro.co",
    "https://preview.biztro.co",
    "http://localhost:3000"
  ],
  databaseHooks: {
    session: {
      create: {
        before: async session => {
          // Perform any necessary transformations or validations on the session data
          const organization = await getActiveOrganization(session.userId)
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id
            }
          }
        }
      },
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60 // 5 minutes
      }
    }
  },
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
      prompt: "select_account",
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
          }
        }
      },
      async sendInvitationEmail(data: {
        id: string
        email: string
        inviter: { user: { name: string; email: string } }
        organization: { name: string }
      }) {
        // Implement your email sending logic here
        console.log("Sending invitation email...")
        const baseUrl = getBaseUrl()
        const inviteLink = `${baseUrl}/invite/${data.id}`
        console.log("Invite link:", inviteLink)
        sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink
        })
      }
    }),
    // Stripe billing integration via Better Auth plugin (server-side)
    stripe({
      // Pass an initialized Stripe client (recommended by the plugin docs)
      stripeClient: stripeClient,
      // Webhook signing secret for verifying Stripe webhook payloads
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      // Create a Stripe customer automatically when users sign up
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "basic",
            priceId: "price_1SFlpfEx6h9wDx2iHBMXleOI",
            limits: {
              menus: 1,
              products: 10
            }
          },
          {
            name: "pro",
            priceId: "price_1QHe5WEx6h9wDx2iLqP5S1sg",
            annualDiscountPriceId: "price_1QHr5cEx6h9wDx2iuhTQX1Mp",
            limits: {
              menus: 100,
              products: 1000
            },
            freeTrial: {
              days: 30
            }
          }
        ]
      }
    })
  ]
})

export type AuthMember = typeof auth.$Infer.Member
