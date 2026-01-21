import { PostHog } from "posthog-node"

import { env } from "@/env.mjs"

let posthogClient: PostHog | null = null

export function getPostHogClient() {
  if (!posthogClient && process.env.NODE_ENV === "production") {
    posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.POSTHOG_HOST || "https://us.posthog.com"
    })
  }
  return posthogClient
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient()
  if (client) {
    client.capture({
      distinctId: "server",
      event,
      properties
    })
  }
}

export function shutdownPostHog() {
  if (posthogClient) {
    posthogClient.shutdown()
  }
}
