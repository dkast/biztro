"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

import { useSession } from "@/lib/auth-client"
import { env } from "@/env.mjs"

if (typeof window !== "undefined") {
  const posthogKey =
    process.env.NODE_ENV === "production"
      ? env.NEXT_PUBLIC_POSTHOG_KEY
      : "next_public_fake_posthog_key"

  posthog.init(posthogKey, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "always", // or 'always' to create profiles for anonymous users as well,
    autocapture: process.env.NODE_ENV === "production",
    capture_pageview: false, // Disable automatic pageview capture for App Router
    // skipcq: JS-0240
    loaded: function (posthog) {
      if (process.env.NODE_ENV === "development") {
        posthog.opt_out_capturing()
        // posthog.set_config({
        //   disable_session_recording: true
        // })
      }
    }
  })
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogWrapper>
        <PageviewTracker />
        {children}
      </PostHogWrapper>
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

function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track pageview on route change
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture("$pageview", {
        $current_url: url
      })
    }
     
  }, [pathname, searchParams])

  return null
}
