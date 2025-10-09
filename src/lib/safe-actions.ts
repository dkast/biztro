import { Logger } from "next-axiom"
import { createSafeActionClient } from "next-safe-action"
import { redirect } from "next/navigation"

import { getCurrentMembership } from "@/server/actions/user/queries"
import { getCurrentUser } from "@/lib/session"

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error(e)
    const log = new Logger()
    log.error("Error in safe action", e)
    log.flush()
  }
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return next({ ctx: { user } })
})

export const authMemberActionClient = authActionClient.use(async ({ next }) => {
  const member = await getCurrentMembership()

  if (!member?.user) {
    redirect("/login")
  }

  return next({ ctx: { member } })
})
