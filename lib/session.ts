import { cache } from "react"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions)

  return session?.user ?? null
})
