import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import type { Role } from "@prisma/client"
import type { DefaultSession, NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import prisma from "@/lib/prisma"
import { env } from "@/env.mjs"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string
      // ...other properties
      name: string
      email: string
      image?: string | null
    }
  }

  interface User {
    // ...other properties
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user }) {
      const found = await prisma.invite.count({
        where: {
          email: user.email ?? ""
        }
      })

      // If found invite then allow to continue
      if (found) {
        return true
      } else {
        return false
      }
    },
    async session({ session, token }) {
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
    async jwt({ token, user }) {
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
    signIn: "/login"
    // error: "/app/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET
}
