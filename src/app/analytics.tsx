"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

import { env } from "@/env.mjs"

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "always" // or 'always' to create profiles for anonymous users as well
  })
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogWrapper>{children}</PostHogWrapper>
    </PostHogProvider>
  )
}

function PostHogWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name
      })
    } else {
      posthog.reset()
    }
  }, [session])

  return children
}
