import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import type { Role } from "@prisma/client"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import prisma from "@/lib/prisma"
import { env } from "@/env.mjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET
    })
  ],
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
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role
        }
      }
    }
  },
  pages: {
    signIn: "/app/auth/sign-in",
    error: "/app/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: string
    }
  }

  interface User {
    role: string
  }
}
