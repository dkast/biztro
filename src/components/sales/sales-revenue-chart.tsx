"use client"

import { BarChart3 } from "lucide-react"

import { Bar } from "@/components/charts/bar"
import { BarChart } from "@/components/charts/bar-chart"
import { BarXAxis } from "@/components/charts/bar-x-axis"
import { chartCssVars, useYScale } from "@/components/charts/chart-context"
import { Grid } from "@/components/charts/grid"
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { formatPrice, type Currency } from "@/lib/currency"
import type { SalesDashboardPeriod } from "@/lib/sales-dashboard-period"
import type { SalesChartBucket } from "@/lib/types/sales"

function SalesRevenueYAxis({ currency }: { currency: Currency }) {
  const yScale = useYScale()
  const ticks = yScale.ticks?.(4) ?? []
  const [rangeStart = 0, rangeEnd = 0] = yScale.range?.() ?? []

  if (ticks.length === 0) {
    return null
  }

  return (
    <g aria-hidden="true" pointerEvents="none">
      <text
        className="fill-muted-foreground text-[10px] font-medium"
        textAnchor="middle"
        transform={`translate(-58 ${(rangeStart + rangeEnd) / 2}) rotate(-90)`}
      >
        Monto
      </text>
      {ticks.map(tick => (
        <text
          key={tick}
          className="fill-muted-foreground text-[10px] tabular-nums sm:text-xs"
          dominantBaseline="middle"
          textAnchor="end"
          x={-12}
          y={yScale(tick) ?? 0}
        >
          {formatPrice(tick, currency)}
        </text>
      ))}
    </g>
  )
}

SalesRevenueYAxis.displayName = "YAxis"

export function SalesRevenueChart({
  chart,
  currency,
  period
}: {
  chart: SalesChartBucket[]
  currency: Currency
  period: SalesDashboardPeriod
}) {
  const hasSales = chart.some(bucket => bucket.sales > 0)

  if (!hasSales) {
    return (
      <Empty className="min-h-72 rounded-none border-0 p-6 md:p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BarChart3 />
          </EmptyMedia>
          <EmptyTitle>Sin ventas en este periodo</EmptyTitle>
          <EmptyDescription>
            Cambia el filtro o registra nuevas ventas para ver la tendencia.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      <BarChart
        data={chart}
        xDataKey="label"
        aspectRatio="4 / 1"
        mobileAspectRatio="4 / 3"
        className="min-h-72 sm:min-h-0"
        margin={{ top: 20, right: 24, bottom: 36, left: 72 }}
        revealSignature={period}
        stacked
        stackGap={2}
      >
        <Grid horizontal numTicksRows={4} />
        <Bar
          dataKey="paidAtSale"
          fill={chartCssVars.linePrimary}
          lineCap={3}
          stackGap={2}
        />
        <Bar
          dataKey="creditGenerated"
          fill={chartCssVars.lineSecondary}
          lineCap={3}
          stackGap={2}
        />
        <SalesRevenueYAxis currency={currency} />
        <BarXAxis
          maxLabels={period === "7d" ? 7 : 12}
          showAllLabels={period === "7d"}
        />
        <ChartTooltip
          showDatePill={true}
          showDots={false}
          content={({ point }) => {
            const label = String(point.label ?? "")
            const sales = typeof point.sales === "number" ? point.sales : 0
            const paidAtSale =
              typeof point.paidAtSale === "number" ? point.paidAtSale : 0
            const creditGenerated =
              typeof point.creditGenerated === "number"
                ? point.creditGenerated
                : 0
            const orders = typeof point.orders === "number" ? point.orders : 0

            return (
              <div className="rounded-md px-3 py-2 text-sm shadow-sm">
                <div className="font-medium">{label}</div>
                <div className="mt-1 flex flex-col gap-1">
                  <span className="font-medium">
                    Ventas: {formatPrice(sales, currency)}
                  </span>
                  <span className="text-gray-400">
                    Pagado al vender: {formatPrice(paidAtSale, currency)}
                  </span>
                  <span className="text-gray-400">
                    Crédito generado: {formatPrice(creditGenerated, currency)}
                  </span>
                  <span className="text-gray-400">{orders} ventas</span>
                </div>
              </div>
            )
          }}
        />
      </BarChart>
      <div className="flex flex-wrap gap-x-4 gap-y-2 px-1 text-xs">
        <span className="text-muted-foreground inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: chartCssVars.linePrimary }}
          />
          Pagado al vender
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: chartCssVars.lineSecondary }}
          />
          Crédito generado
        </span>
      </div>
    </div>
  )
}
