import { fromDate, parseDate, toCalendarDate } from "@internationalized/date"

export const salesReportingTimeZone = "America/Mexico_City"

export function getSalesReportingDateTime(date: Date) {
  return fromDate(date, salesReportingTimeZone)
}

export function getSalesReportingDate(date = new Date()) {
  return toCalendarDate(getSalesReportingDateTime(date))
}

export function parseSalesReportingDate(value: string | null | undefined) {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number(value.slice(0, 4)) < 100
  ) {
    return null
  }

  try {
    return parseDate(value)
  } catch {
    return null
  }
}
