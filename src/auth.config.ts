import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

import { env } from "@/env.mjs"

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET
    })
  ]
} satisfies NextAuthConfig
