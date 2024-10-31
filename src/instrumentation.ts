import * as Sentry from "@sentry/nextjs"

export async function register() {
  // Don't register Sentry in TurboPack
  if (process.env.TURBOPACK) {
    return
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
  }
}

export const onRequestError = Sentry.captureRequestError
