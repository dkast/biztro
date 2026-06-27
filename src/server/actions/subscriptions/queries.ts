import * as Sentry from "@sentry/nextjs"
import { cacheLife, cacheTag } from "next/cache"
import { headers } from "next/headers"

import { getStripeBillingApi } from "@/lib/auth"

// Get the current active subscription in the organization
export const getCurrentSubscription = async (organizationId: string) => {
  "use cache: private"
  cacheTag(`organization-${organizationId}-subscription`)
  cacheLife({ stale: 60 })

  const stripeBillingApi = getStripeBillingApi()

  if (!stripeBillingApi) {
    return null
  }

  try {
    const subscriptions = await stripeBillingApi.listActiveSubscriptions({
      query: {
        referenceId: organizationId
      },
      headers: await headers()
    })

    const activeSubscription = subscriptions.find(
      sub => sub.status === "active" || sub.status === "trialing"
    )

    return activeSubscription
  } catch (error) {
    console.error("Failed to get current subscription", error)
    Sentry.captureException(error, {
      tags: {
        section: "subscription-queries",
        operation: "getCurrentSubscription"
      },
      extra: { organizationId }
    })
    return null
  }
}
