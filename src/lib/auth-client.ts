import { stripeClient } from "@better-auth/stripe/client"
import {
  inferOrgAdditionalFields,
  organizationClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  plugins: [
    // Add any necessary plugins here
    organizationClient({
      schema: inferOrgAdditionalFields({
        organization: {
          additionalFields: {
            newField: {
              type: "string",
              description: "A new field for the organization"
            }
          }
        }
      })
    }),
    stripeClient({
      subscription: true
    })
  ]
})
export const { signIn, signUp, useSession, signOut } = authClient
