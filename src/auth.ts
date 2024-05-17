import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user }) {
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

      // If found invite then allow to continue
      return found > 0
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
    newUser: "/new-org"
    // error: "/app/auth/error"
  },
  events: {
    // skipcq: JS-0116
    async signOut() {
      cookies().delete(appConfig.cookieOrg)
    }
  },
  ...authConfig
})
