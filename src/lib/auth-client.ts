import { stripeClient } from "@better-auth/stripe/client"
import {
  adminClient,
  inferOrgAdditionalFields,
  organizationClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"
import { ac, roles } from "@/lib/auth-admin-access"

export const authClient = createAuthClient({
  plugins: [
    // Add any necessary plugins here
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>()
    }),
    stripeClient({
      subscription: true
    }),
    adminClient({
      ac,
      roles
    })
  ]
})
export const { signIn, signUp, useSession, signOut } = authClient
