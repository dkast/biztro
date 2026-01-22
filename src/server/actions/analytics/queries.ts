"use server"

import * as Sentry from "@sentry/nextjs"
import { z } from "zod/v4"

import { getCurrentOrganization } from "@/server/actions/user/queries"
import { authActionClient } from "@/lib/safe-actions"
import { env } from "@/env.mjs"

/**
 * Get analytics data from PostHog for a specific organization
 *
 * @param dateRange - Number of days to look back (7 or 30)
 * @returns Analytics data with public menu view counts
 */
export const getOrganizationAnalytics = authActionClient
  .inputSchema(
    z.object({
      dateRange: z.enum(["7", "30"]).default("7")
    })
  )
  .action(async ({ parsedInput: { dateRange } }) => {
    const currentOrg = await getCurrentOrganization()

    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    // Only query PostHog in production and if API key is configured
    if (
      process.env.NODE_ENV !== "production" ||
      !env.POSTHOG_API_KEY ||
      !env.NEXT_PUBLIC_POSTHOG_KEY
    ) {
      return {
        success: {
          publicMenuViews: 0,
          dateRange: parseInt(dateRange)
        }
      }
    }

    try {
      const posthogHost = env.POSTHOG_HOST || "https://us.posthog.com"
      const daysAgo = parseInt(dateRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      // Query PostHog's Query API for event counts
      const query = {
        kind: "EventsQuery",
        select: ["*"],
        event: "public_menu_viewed",
        where: [
          `properties.organization_id = '${currentOrg.id}'`,
          `timestamp >= '${startDate.toISOString()}'`
        ],
        limit: 10000
      }

      const response = await fetch(
        `${posthogHost}/api/projects/${env.NEXT_PUBLIC_POSTHOG_KEY}/query/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.POSTHOG_API_KEY}`
          },
          body: JSON.stringify({ query })
        }
      )

      if (!response.ok) {
        Sentry.captureMessage(
          `PostHog API error: ${response.statusText}`,
          "error"
        )
        return {
          failure: {
            reason: "Error al obtener datos de analítica"
          }
        }
      }

      const data = await response.json()
      const publicMenuViews = data.results?.length || 0

      return {
        success: {
          publicMenuViews,
          dateRange: daysAgo
        }
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "analytics" },
        extra: { organizationSlug: currentOrg.slug }
      })
      return {
        failure: {
          reason:
            error instanceof Error
              ? error.message
              : "Error al obtener datos de analítica"
        }
      }
    }
  })

/**
 * Get analytics trend data from PostHog for a specific organization
 * Returns views grouped by day for trend charts
 *
 * @param dateRange - Number of days to look back (7 or 30)
 * @returns Analytics trend data with daily public menu view counts
 */
export const getOrganizationAnalyticsTrend = authActionClient
  .inputSchema(
    z.object({
      dateRange: z.enum(["7", "30"]).default("7")
    })
  )
  .action(async ({ parsedInput: { dateRange } }) => {
    const currentOrg = await getCurrentOrganization()

    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    // Only query PostHog in production and if API key is configured
    if (
      process.env.NODE_ENV !== "production" ||
      !env.POSTHOG_API_KEY ||
      !env.NEXT_PUBLIC_POSTHOG_KEY
    ) {
      // Return mock data for development
      const daysAgo = parseInt(dateRange)
      const mockData = []
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        mockData.push({
          date: date.toISOString().split("T")[0],
          count: 0
        })
      }
      return {
        success: {
          trend: mockData,
          dateRange: daysAgo
        }
      }
    }

    try {
      const posthogHost = env.POSTHOG_HOST || "https://us.posthog.com"
      const daysAgo = parseInt(dateRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)
      const endDate = new Date()

      // Query PostHog's Trends API for daily aggregated counts
      const query = {
        kind: "TrendsQuery",
        series: [
          {
            kind: "EventsNode",
            event: "public_menu_viewed",
            name: "public_menu_viewed",
            math: "total"
          }
        ],
        dateRange: {
          date_from: startDate.toISOString().split("T")[0],
          date_to: endDate.toISOString().split("T")[0]
        },
        interval: "day",
        properties: [
          {
            key: "organization_id",
            value: currentOrg.id,
            operator: "exact",
            type: "event"
          }
        ]
      }

      const response = await fetch(
        `${posthogHost}/api/projects/${env.NEXT_PUBLIC_POSTHOG_KEY}/query/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.POSTHOG_API_KEY}`
          },
          body: JSON.stringify({ query })
        }
      )

      if (!response.ok) {
        // console.error("PostHog API error:", response.statusText)
        return {
          failure: {
            reason: "Error al obtener datos de tendencia"
          }
        }
      }

      const data = await response.json()

      // Transform PostHog response into daily counts
      const trend: Array<{ date: string; count: number }> = []

      if (data.results?.[0]) {
        const result = data.results[0]
        const labels = result.labels || []
        const counts = result.data || []

        for (let i = 0; i < labels.length; i++) {
          trend.push({
            date: labels[i],
            count: counts[i] || 0
          })
        }
      }

      return {
        success: {
          trend,
          dateRange: daysAgo
        }
      }
    } catch (error) {
      // console.error("Error fetching analytics trend:", error)
      return {
        failure: {
          reason:
            error instanceof Error
              ? error.message
              : "Error al obtener datos de tendencia"
        }
      }
    }
  })
