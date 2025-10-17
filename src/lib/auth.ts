import { stripe } from "@better-auth/stripe"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins"
import Stripe from "stripe"

import {
  getActiveOrganization,
  isInviteEnabled
} from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { getBaseUrl, sendOrganizationInvitation } from "@/lib/utils"

const INVITE_CHECK_PATH_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/oauth",
  "/callback"
]
const INVITE_DENIED_REDIRECT = "/auth-error?typeError=AccessDenied"

function extractEmailFromContext(ctx: Record<string, unknown> | undefined) {
  if (!ctx) {
    return null
  }

  const body = ctx.body as Record<string, unknown> | undefined
  const query = ctx.query as Record<string, unknown> | undefined
  const innerContext = ctx.context as Record<string, unknown> | undefined
  const session = innerContext?.session as Record<string, unknown> | undefined
  const sessionUser = session?.user as Record<string, unknown> | undefined
  const user = innerContext?.user as Record<string, unknown> | undefined
  const oauth = innerContext?.oauth as Record<string, unknown> | undefined
  const oauthUser = oauth?.user as Record<string, unknown> | undefined
  const oauthProfile = oauth?.profile as Record<string, unknown> | undefined
  const bodyUser = body?.user as Record<string, unknown> | undefined

  const candidates = [
    body?.email,
    body?.identifier,
    bodyUser?.email,
    query?.email,
    sessionUser?.email,
    user?.email,
    oauthUser?.email,
    oauthProfile?.email
  ]

  const found = candidates.find(
    value => typeof value === "string" && value.trim().length > 0
  )

  return found ? String(found).trim().toLowerCase() : null
}

// skipcq: JS-0339
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover"
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  // Adjust trusted origins for your deployment
  trustedOrigins: [
    "https://biztro.co",
    "https://preview.biztro.co",
    "http://localhost:3000"
  ],
  hooks: {
    before: createAuthMiddleware(async ctx => {
      const path = ctx.path ?? ""

      console.log("Auth middleware path:", path)
      const shouldCheck = INVITE_CHECK_PATH_PREFIXES.some(prefix =>
        path.startsWith(prefix)
      )

      if (!shouldCheck) {
        return
      }

      console.log("Checking invite status for path:", path)
      const email = extractEmailFromContext(ctx)

      if (!email) {
        return
      }

      console.log("Extracted email:", email)
      const enabled = await isInviteEnabled(email)

      if (!enabled) {
        throw ctx.redirect(INVITE_DENIED_REDIRECT)
      }
    })
  },
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
      // skipcq: JS-0339
      clientId: process.env.AUTH_GOOGLE_ID!,
      // skipcq: JS-0339
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
        const baseUrl = getBaseUrl()
        const inviteLink = `${baseUrl}/invite/${data.id}`
        // console.log("Invite link:", inviteLink)
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
      stripeClient,
      // Webhook signing secret for verifying Stripe webhook payloads
      // skipcq: JS-0339
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      // Create a Stripe customer automatically when users sign up
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "BASIC",
            // skipcq: JS-0339
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!,
            limits: {
              menus: 1,
              products: 10
            }
          },
          {
            name: "PRO",
            // skipcq: JS-0339
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
            // skipcq: JS-0339
            annualDiscountPriceId:
              process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
            limits: {
              menus: 100,
              products: 1000
            },
            freeTrial: {
              days: 30
            }
          }
        ],
        authorizeReference: async ({ user, referenceId }) => {
          // Ensure the user is authorized to manage the organization
          const member = await prisma.member.findFirst({
            where: {
              userId: user.id,
              organizationId: referenceId
            }
          })

          return member?.role === "owner" || member?.role === "admin"
        }
      }
    })
  ]
})

export type AuthMember = typeof auth.$Infer.Member
