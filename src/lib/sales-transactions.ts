import { z } from "zod/v4"

import {
  formatSalesClosingDateValue,
  parseSalesClosingDateValue
} from "@/lib/sales-closing-date"
import { paymentMethodValues, paymentStatusValues } from "@/lib/types/payments"
import { salesOrderTypeValues, saleStatusValues } from "@/lib/types/sales"

export const salesTransactionDateRangeValues = ["30d", "all", "custom"] as const

export const salesTransactionFilterValues = {
  status: ["all", ...saleStatusValues] as const,
  orderType: ["all", ...salesOrderTypeValues] as const,
  paymentStatus: ["all", ...paymentStatusValues] as const,
  paymentMethod: ["all", ...paymentMethodValues, "LEGACY"] as const
}

export const salesTransactionPageSize = 25
export const salesTransactionExportLimit = 10_000
export const salesTransactionExportFetchLimit = salesTransactionExportLimit + 1

export function isSalesTransactionExportOverLimit(totalCount: number) {
  return totalCount > salesTransactionExportLimit
}

export const defaultSalesTransactionFilters = {
  range: "30d",
  from: "",
  to: "",
  status: "all",
  orderType: "all",
  paymentStatus: "all",
  paymentMethod: "all",
  q: "",
  page: 1
} as const

const salesTransactionsSearchSchema = z.object({
  range: z.enum(salesTransactionDateRangeValues).default("30d"),
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.enum(salesTransactionFilterValues.status).default("all"),
  orderType: z.enum(salesTransactionFilterValues.orderType).default("all"),
  paymentStatus: z
    .enum(salesTransactionFilterValues.paymentStatus)
    .default("all"),
  paymentMethod: z
    .enum(salesTransactionFilterValues.paymentMethod)
    .default("all"),
  q: z.string().trim().max(100).default(""),
  page: z
    .string()
    .regex(/^[1-9]\d{0,4}$/)
    .default("1")
})

export type SalesTransactionDateRange =
  (typeof salesTransactionDateRangeValues)[number]

export type SalesTransactionQueryState = {
  range: SalesTransactionDateRange
  from: string
  to: string
  status: (typeof salesTransactionFilterValues.status)[number]
  orderType: (typeof salesTransactionFilterValues.orderType)[number]
  paymentStatus: (typeof salesTransactionFilterValues.paymentStatus)[number]
  paymentMethod: (typeof salesTransactionFilterValues.paymentMethod)[number]
  q: string
  page: number
}

export type SalesTransactionFilters = Omit<
  z.infer<typeof salesTransactionsSearchSchema>,
  "page"
> & {
  page: number
  startDate: Date | null
  endDate: Date | null
}

export type SalesTransactionsSearchParams =
  | { valid: true; filters: SalesTransactionFilters }
  | { valid: false; error: string }

type SearchParams =
  URLSearchParams | Record<string, string | string[] | undefined>

function toSearchParamsRecord(params: SearchParams) {
  if (!(params instanceof URLSearchParams)) return params

  const record: Record<string, string | string[]> = {}
  for (const [key, value] of params) {
    const existing = record[key]
    record[key] = existing
      ? Array.isArray(existing)
        ? [...existing, value]
        : [existing, value]
      : value
  }
  return record
}

function normalizeDateRange(
  range: SalesTransactionDateRange,
  from: string | undefined,
  to: string | undefined,
  now: Date
): { startDate: Date | null; endDate: Date | null; error?: string } {
  if (range === "all") return { startDate: null, endDate: null }

  if (range === "custom") {
    const startDate = parseSalesClosingDateValue(from)
    const finalDate = parseSalesClosingDateValue(to)

    if (!startDate || !finalDate) {
      return {
        startDate: null,
        endDate: null,
        error: "Selecciona una fecha inicial y final válidas."
      }
    }

    if (startDate > finalDate) {
      return {
        startDate: null,
        endDate: null,
        error: "La fecha inicial no puede ser posterior a la fecha final."
      }
    }

    finalDate.setDate(finalDate.getDate() + 1)
    return { startDate, endDate: finalDate }
  }

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 29)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 1)

  return { startDate, endDate }
}

export function parseSalesTransactionsSearchParams(
  params: SearchParams,
  now = new Date()
): SalesTransactionsSearchParams {
  const normalizedParams = toSearchParamsRecord(params)
  const parsed = salesTransactionsSearchSchema.safeParse(normalizedParams)

  if (!parsed.success) {
    return {
      valid: false,
      error:
        "Uno o más filtros no son válidos. Revisa los valores o restablece los filtros."
    }
  }

  const dateRange = normalizeDateRange(
    parsed.data.range,
    parsed.data.from,
    parsed.data.to,
    now
  )

  if (dateRange.error) {
    return { valid: false, error: dateRange.error }
  }

  return {
    valid: true,
    filters: {
      ...parsed.data,
      page: Number(parsed.data.page),
      ...dateRange
    }
  }
}

export function getSalesTransactionExportFilename(now = new Date()) {
  return `transacciones-${formatSalesClosingDateValue(now)}.csv`
}

export function hasActiveSalesTransactionFilters(
  filters: SalesTransactionFilters
) {
  return (
    filters.range !== "30d" ||
    filters.status !== "all" ||
    filters.orderType !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.q.length > 0
  )
}
