import {
  getLocalTimeZone,
  parseTime,
  startOfWeek,
  Time,
  toCalendarDateTime,
  today
} from "@internationalized/date"
import type { OpeningHours } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get initials from name string
export function getInitials(name: string | undefined | null) {
  if (!name) return ""
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

export function getOpenHoursStatus(openingHours: OpeningHours[]) {
  let status = "Cerrado"

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
        weekDayNbr = 7
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

    const formatClosed = closeDateTime
      .toDate(getLocalTimeZone())
      .toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
      })

    // console.log(currentTime, openDateTime, closeDateTime)
    if (
      currentTime.compare(openDateTime) >= 0 &&
      currentTime.compare(closeDateTime) <= 0
    ) {
      status = `Abierto - Hasta ${endTime.hour === 1 ? "la" : "las"} ${formatClosed}`
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
