import { Logger } from "next-axiom"
import { createSafeActionClient } from "next-safe-action"

import { getCurrentUser } from "@/lib/session"

export const actionClient = createSafeActionClient({
  handleServerErrorLog(e) {
    console.error(e)
    const log = new Logger()
    log.error("Error in safe action", e)
    log.flush()
  }
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Failed to authenticate")
  }

  return next({ ctx: { user } })
})
