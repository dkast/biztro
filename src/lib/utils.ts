import InviteUserEmail from "@/emails/invite"
import type { OpeningHours } from "@/generated/prisma-client/client"
import {
  getLocalTimeZone,
  parseTime,
  startOfWeek,
  Time,
  toCalendarDateTime,
  today
} from "@internationalized/date"
import * as Sentry from "@sentry/nextjs"
import { clsx, type ClassValue } from "clsx"
import { Resend } from "resend"
import { twMerge } from "tailwind-merge"

import { authClient } from "@/lib/auth-client"
import { env } from "@/env.mjs"
import { getUILabels } from "@/lib/ui-labels"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get initials from name string
export function getInitials(name: string | undefined | null) {
  if (!name) return "-"
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .join("")
}

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production")
    return "https://biztro.co"
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview")
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  return "http://localhost:3000"
}

export const getPublishedMenuUrl = (subdomain: string) => {
  const baseUrl = getBaseUrl()
  if (!subdomain) return baseUrl

  try {
    const url = new URL(baseUrl)
    const isBiztroHost =
      url.hostname === "biztro.co" || url.hostname.endsWith(".biztro.co")
    if (!isBiztroHost) return `${baseUrl}/${subdomain}`

    return `${url.protocol}//${subdomain}.biztro.co`
  } catch {
    return `${baseUrl}/${subdomain}`
  }
}

export function getOpenHoursLegend(
  openingHours: OpeningHours[],
  locale?: string | null
) {
  const t = getUILabels(locale ?? null)
  let status = t("closed")

  // If there are no defined opening hours, show that there's no schedule.
  if (!openingHours || openingHours.length === 0) {
    return t("no_schedule")
  }

  // If all days are marked as closed (allDay: false), show that there's no schedule.
  if (openingHours.every(hour => hour.allDay === false)) {
    return t("no_schedule")
  }

  const currentDate = today(getLocalTimeZone())
  const now = new Date()
  const currentTime = toCalendarDateTime(
    currentDate,
    new Time(now.getHours(), now.getMinutes())
  )
  const startWeek = startOfWeek(currentDate, "es-MX")
  // console.log("startWeek", startWeek)

  for (const day of openingHours) {
    // convert day to date based on the week start
    let weekDayNbr = 0
    switch (day.day) {
      case "MONDAY":
        weekDayNbr = 1
        break
      case "TUESDAY":
        weekDayNbr = 2
        break
      case "WEDNESDAY":
        weekDayNbr = 3
        break
      case "THURSDAY":
        weekDayNbr = 4
        break
      case "FRIDAY":
        weekDayNbr = 5
        break
      case "SATURDAY":
        weekDayNbr = 6
        break
      case "SUNDAY":
        weekDayNbr = 0
        break
      default:
        break
    }

    if (!day.allDay) {
      continue
    }

    const dayDate = startWeek.add({ days: weekDayNbr })
    // console.log(startWeek, weekDayNbr, dayDate)
    const startTime = parseTime(day.startTime ?? "")
    const endTime = parseTime(day.endTime ?? "")

    const openDateTime = toCalendarDateTime(dayDate, startTime)

    let closeDateTime
    if (endTime.hour < startTime.hour) {
      closeDateTime = toCalendarDateTime(dayDate.add({ days: 1 }), endTime)
    } else {
      closeDateTime = toCalendarDateTime(dayDate, endTime)
    }

    const timeLocale = locale ?? "es-MX"
    const formatClosed = closeDateTime
      .toDate(getLocalTimeZone())
      .toLocaleTimeString(timeLocale, {
        hour: "2-digit",
        minute: "2-digit"
      })

    // console.log(currentTime, openDateTime, closeDateTime)
    if (
      currentTime.compare(openDateTime) >= 0 &&
      currentTime.compare(closeDateTime) <= 0
    ) {
      status = t(endTime.hour === 1 ? "open_until_singular" : "open_until_plural", {
        time: formatClosed
      })
      break
    }
  }

  return status
}

export function getOpenHoursStatus(openingHours: OpeningHours[]) {
  let status = "CLOSED"
  const currentDate = today(getLocalTimeZone())
  const now = new Date()
  const currentTime = toCalendarDateTime(
    currentDate,
    new Time(now.getHours(), now.getMinutes())
  )

  const startWeek = startOfWeek(currentDate, "es-MX")

  for (const day of openingHours) {
    // convert day to date based on the week start
    let weekDayNbr = 0
    switch (day.day) {
      case "MONDAY":
        weekDayNbr = 1
        break
      case "TUESDAY":
        weekDayNbr = 2
        break
      case "WEDNESDAY":
        weekDayNbr = 3
        break
      case "THURSDAY":
        weekDayNbr = 4
        break
      case "FRIDAY":
        weekDayNbr = 5
        break
      case "SATURDAY":
        weekDayNbr = 6
        break
      case "SUNDAY":
        weekDayNbr = 0
        break
      default:
        break
    }

    if (!day.allDay) {
      continue
    }

    const dayDate = startWeek.add({ days: weekDayNbr })
    const startTime = parseTime(day.startTime ?? "")
    const endTime = parseTime(day.endTime ?? "")

    const openDateTime = toCalendarDateTime(dayDate, startTime)

    let closeDateTime
    if (endTime.hour < startTime.hour) {
      closeDateTime = toCalendarDateTime(dayDate.add({ days: 1 }), endTime)
    } else {
      closeDateTime = toCalendarDateTime(dayDate, endTime)
    }

    if (
      currentTime.compare(openDateTime) >= 0 &&
      currentTime.compare(closeDateTime) <= 0
    ) {
      status = "OPEN"
      break
    }
  }

  return status
}

export function getFormattedTime(time: string | null | undefined) {
  if (!time) {
    return "NA"
  }
  const parsedTime = parseTime(time)
  const currentDate = today(getLocalTimeZone())
  const timeDate = toCalendarDateTime(currentDate, parsedTime)
  return timeDate
    .toDate(getLocalTimeZone())
    .toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
}

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined
) => {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined
  }

  const currentDate = new Date() // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  ) // Add trial days
  return Math.floor(trialEnd.getTime() / 1000) // Convert to Unix timestamp in seconds
}

export const toDateTime = (secs: number) => {
  const t = new Date(+0) // Unix epoch start.
  t.setSeconds(secs)
  return t
}

export const sendOrganizationInvitation = async ({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink
}: {
  email: string
  invitedByUsername: string
  invitedByEmail: string
  teamName: string
  inviteLink: string
}) => {
  // Send email invitation
  const resend = new Resend(env.RESEND_API_KEY)

  // Extract shortname from email address
  const shortname = email.split("@")[0]

  const baseUrl = getBaseUrl()

  const { error } = await resend.emails.send({
    from: "noreply@biztro.co",
    to: email,
    subject: `Invitación a unirse a ${teamName}`,
    react: InviteUserEmail({
      username: shortname,
      invitedByUsername,
      invitedByEmail,
      teamName,
      inviteLink,
      baseUrl
    })
  })

  if (error) {
    console.error("Error sending invitation email:", error)
    Sentry.captureException(error, {
      tags: { section: "email" },
      extra: { recipientEmail: email, teamName }
    })
  }
}

export async function upgradeOrganizationPlan(
  organizationId: string,
  newPlan: "BASIC" | "PRO"
) {
  try {
    const { data, error } = await authClient.organization.update({
      data: {
        plan: newPlan
      },
      organizationId: organizationId as string
    })

    if (error || !data) {
      console.error("Error upgrading organization plan:", error)
      Sentry.captureException(error, {
        tags: { section: "organization-plan" },
        extra: { organizationId, newPlan }
      })
      return {
        failure: {
          reason: "No se pudo actualizar el plan de la organización"
        }
      }
    }

    return { success: true }
  } catch (error) {
    let message
    if (typeof error === "string") {
      message = error
    } else if (error instanceof Error) {
      message = error.message
    }
    return {
      failure: {
        reason: message
      }
    }
  }
}

/**
 * Generates a cache-busted image URL for R2 assets.
 * Appends a version query parameter based on the entity's updatedAt timestamp
 * to ensure fresh images are loaded when content is replaced.
 *
 * @param storageKey - The R2 storage key (e.g., "orgs/123/menu-items/456/image")
 * @param updatedAt - The entity's last updated timestamp
 * @returns The full URL with cache-busting query parameter
 */
export function getCacheBustedImageUrl(
  storageKey: string,
  updatedAt: Date
): string {
  const timestamp = updatedAt.getTime()
  return `${env.R2_CUSTOM_DOMAIN}/${storageKey}?v=${timestamp}`
}

/** Naive luminance check: returns true when hex color is perceptually dark. */
export function isColorDark(hex: string): boolean {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  // Perceived luminance (ITU-R BT.601)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
