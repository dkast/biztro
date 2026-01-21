"use client"

import { useEffect } from "react"
import { usePostHog } from "posthog-js/react"

interface PublicMenuTrackerProps {
  organizationId: string
  menuId: string
  slug: string
}

export default function PublicMenuTracker({
  organizationId,
  menuId,
  slug
}: PublicMenuTrackerProps) {
  const posthog = usePostHog()

  useEffect(() => {
    // Track public menu view
    posthog.capture("public_menu_viewed", {
      organization_id: organizationId,
      menu_id: menuId,
      slug,
      path: window.location.pathname,
      hostname: window.location.hostname,
      referrer: document.referrer || undefined
    })
  }, [posthog, organizationId, menuId, slug])

  return null
}
