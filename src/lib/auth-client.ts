import { stripeClient } from "@better-auth/stripe/client"
import {
  inferOrgAdditionalFields,
  organizationClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
  plugins: [
    // Add any necessary plugins here
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>()
    }),
    stripeClient({
      subscription: true
    })
  ]
})
export const { signIn, signUp, useSession, signOut } = authClient
