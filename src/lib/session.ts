import * as Sentry from "@sentry/nextjs"
import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"

import { auth } from "@/lib/auth"

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user ?? null
  } catch (error) {
    unstable_rethrow(error)
    console.error("Error fetching current user:", error)
    Sentry.captureException(error, {
      tags: { section: "session" }
    })
    return null
  }
}
