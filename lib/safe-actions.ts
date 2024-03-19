import { Logger } from "next-axiom"
import { createSafeActionClient } from "next-safe-action"

export const action = createSafeActionClient({
  handleServerErrorLog(e) {
    const log = new Logger()
    log.error("Error in safe action", e)
    log.flush()
  }
})
