import { headers } from "next/headers"

import { auth } from "@/lib/auth"

// Get the current active subscription in the organization
export const getCurrentSubscription = async (organizationId: string) => {
  const subscriptions = await auth.api.listActiveSubscriptions({
    query: {
      referenceId: organizationId
    },
    headers: await headers()
  })

  const activeSubscription = subscriptions.find(
    sub => sub.status === "active" || sub.status === "trialing"
  )

  return activeSubscription
}
