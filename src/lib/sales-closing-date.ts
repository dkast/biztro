import {
  getSalesReportingDate,
  parseSalesReportingDate
} from "@/lib/sales-reporting-date"

const salesClosingDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric"
})

const salesClosingDateLongFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long"
})

function padDateSegment(value: number) {
  return String(value).padStart(2, "0")
}

export function parseSalesClosingDateValue(value: string | null | undefined) {
  const date = parseSalesReportingDate(value)
  // The date picker expects a Date with the selected day in browser-local time.
  return date ? new Date(date.year, date.month - 1, date.day) : null
}

export function formatSalesClosingDateValue(date: Date) {
  return [
    date.getFullYear(),
    padDateSegment(date.getMonth() + 1),
    padDateSegment(date.getDate())
  ].join("-")
}

export function getSalesClosingDateValue(date = new Date()) {
  return getSalesReportingDate(date).toString()
}

export function formatSalesClosingDateLabel(value: string) {
  const date = parseSalesClosingDateValue(value)

  return date ? salesClosingDateFormatter.format(date) : ""
}

export function formatSalesClosingDateLongLabel(value: string) {
  const date = parseSalesClosingDateValue(value)

  return date ? salesClosingDateLongFormatter.format(date) : ""
}

export function resolveSalesClosingDateValue(
  value: string | null | undefined,
  fallbackValue?: string
) {
  const today = getSalesReportingDate()
  const parsedDate = parseSalesReportingDate(value)

  if (!parsedDate || parsedDate.compare(today) > 0) {
    return fallbackValue ?? today.toString()
  }

  return parsedDate.toString()
}
