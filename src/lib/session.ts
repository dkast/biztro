import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user ?? null
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}
