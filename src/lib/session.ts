import { headers } from "next/headers"
import * as Sentry from "@sentry/nextjs"

import { auth } from "@/lib/auth"

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user ?? null
  } catch (error) {
    Sentry.captureException(error, {
      tags: { section: "auth-session" }
    })
    return null
  }
}
