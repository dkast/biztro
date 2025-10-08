"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getBaseUrl } from "@/lib/utils"

export const createStripePortal = async (referenceId: string) => {
  try {
    const data = await auth.api.createBillingPortal({
      body: {
        referenceId: referenceId,
        returnUrl: `${getBaseUrl()}/dashboard/settings/billing`
      },
      headers: await headers()
    })

    return data.url
  } catch (error) {
    console.error(error)
    return null
  }
}
