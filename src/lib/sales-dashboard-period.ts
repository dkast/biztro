export const salesDashboardPeriodValues = ["7d", "1m", "3m", "1y"] as const

export type SalesDashboardPeriod = (typeof salesDashboardPeriodValues)[number]

export const defaultSalesDashboardPeriod =
  "1m" as const satisfies SalesDashboardPeriod

export const salesDashboardPeriodLabels = {
  "7d": "7 días",
  "1m": "1 mes",
  "3m": "3 meses",
  "1y": "1 año"
} as const satisfies Record<SalesDashboardPeriod, string>

export const salesDashboardPeriodRangeLabels = {
  "7d": "Últimos 7 días",
  "1m": "Último mes",
  "3m": "Últimos 3 meses",
  "1y": "Último año"
} as const satisfies Record<SalesDashboardPeriod, string>

export const salesDashboardPeriodSentenceLabels = {
  "7d": "los últimos 7 días",
  "1m": "el último mes",
  "3m": "los últimos 3 meses",
  "1y": "el último año"
} as const satisfies Record<SalesDashboardPeriod, string>

export const salesDashboardPeriodOptions = salesDashboardPeriodValues.map(
  value => ({
    value,
    label: salesDashboardPeriodLabels[value]
  })
)

export function isSalesDashboardPeriod(
  value: string
): value is SalesDashboardPeriod {
  return value in salesDashboardPeriodLabels
}
