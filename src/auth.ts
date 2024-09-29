import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import type { Adapter } from "next-auth/adapters"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { InviteStatus } from "@/lib/types"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user }) {
      // Waitlist check, remove this once the waitlist is removed
      const found = await prisma.invite.count({
        where: {
          email: user.email ?? "",
          enabled: true
        }
      })

      // Find if the user has a membership
      const membership = await prisma.membership.findFirst({
        where: {
          userId: user.id
        },
        include: {
          organization: true
        }
      })

      if (membership) {
        // Set the current organization
        cookies().set(appConfig.cookieOrg, membership.organizationId, {
          maxAge: 60 * 60 * 24 * 365
        })
      }

      // If team invite found then allow to continue
      const invite = await prisma.teamInvite.findFirst({
        where: {
          email: user.email ?? "",
          status: InviteStatus.PENDING
        }
      })

      if (invite) {
        // Accept the invite
        await prisma.teamInvite.update({
          where: {
            id: invite.id
          },
          data: {
            status: InviteStatus.ACCEPTED
          }
        })

        // Add the user to the organization
        if (user.id && invite.organizationId) {
          await prisma.membership.create({
            data: {
              userId: user.id,
              organizationId: invite.organizationId,
              role: invite.role
            }
          })
        }

        // Set the current organization
        cookies().set(appConfig.cookieOrg, invite.organizationId, {
          maxAge: 60 * 60 * 24 * 365
        })

        revalidateTag(`members-${invite.organizationId}`)
      }

      // If found on waitlist, invite or already has a membership then allow to continue
      return found > 0 || !!membership || !!invite
    },
    // skipcq: JS-0116
    async redirect({ url, baseUrl }) {
      console.log("redirect", url, baseUrl)

      // Redirect to /new-org if no organization cookie is set
      const currentOrg = cookies().get(appConfig.cookieOrg)?.value
      if (!currentOrg) {
        return `${baseUrl}/new-org`
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url

      return baseUrl
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub
        }

        if (token.email) {
          session.user.email = token.email
        }
      }

      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      }
      return token
    }
  },
  pages: {
    signIn: "/login",
    newUser: "/new-org",
    error: "/auth-error"
  },
  events: {
    // skipcq: JS-0116
    async signOut() {
      cookies().delete(appConfig.cookieOrg)
    }
  },
  ...authConfig
})
