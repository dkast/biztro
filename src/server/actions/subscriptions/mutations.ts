"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getBaseUrl } from "@/lib/utils"

export const createStripePortal = async (referenceId: string) => {
  try {
    const data = await auth.api.createBillingPortal({
      body: {
        referenceId,
        returnUrl: `${getBaseUrl()}/dashboard/settings/billing`
      },
      headers: await headers()
    })

    updateTag(`organization-${referenceId}-subscription`)
    updateTag("subscription-current")

    return data.url
  } catch (error) {
    console.error(error)
    return null
  }
}
