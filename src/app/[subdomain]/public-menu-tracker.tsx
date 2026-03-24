"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

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
  }, [organizationId, menuId, slug])

  return null
}
