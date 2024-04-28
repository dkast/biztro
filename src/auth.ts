import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"

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

      // If found invite then allow to continue
      return found > 0
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
  ...authConfig
})
