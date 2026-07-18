const salesClosingDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric"
})

const salesClosingDateLongFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long"
})

const salesClosingDateValuePattern = /^\d{4}-\d{2}-\d{2}$/

function padDateSegment(value: number) {
  return String(value).padStart(2, "0")
}

export function parseSalesClosingDateValue(value: string | null | undefined) {
  if (!value || !salesClosingDateValuePattern.test(value)) {
    return null
  }

  const [yearValue, monthValue, dayValue] = value.split("-")
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null
  }

  const parsedDate = new Date(year, month - 1, day)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null
  }

  return parsedDate
}

export function formatSalesClosingDateValue(date: Date) {
  return [
    date.getFullYear(),
    padDateSegment(date.getMonth() + 1),
    padDateSegment(date.getDate())
  ].join("-")
}

export function getSalesClosingDateValue(date = new Date()) {
  return formatSalesClosingDateValue(date)
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
  fallbackValue = getSalesClosingDateValue()
) {
  const parsedDate = parseSalesClosingDateValue(value)

  if (!parsedDate) {
    return fallbackValue
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  if (parsedDate > todayStart) {
    return fallbackValue
  }

  return formatSalesClosingDateValue(parsedDate)
}
