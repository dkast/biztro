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

  if (ticks.length === 0) {
    return null
  }

  return (
    <g aria-hidden="true" pointerEvents="none">
      {ticks.map(tick => (
        <text
          key={tick}
          className="fill-muted-foreground hidden text-xs tabular-nums
            md:inline"
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

export function SalesRevenueChart({
  chart,
  currency,
  period
}: {
  chart: SalesChartBucket[]
  currency: Currency
  period: SalesDashboardPeriod
}) {
  const hasSales = chart.some(bucket => bucket.revenue > 0)

  if (!hasSales) {
    return (
      <Empty className="min-h-72 rounded-none border-0 p-0">
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
    <BarChart
      data={chart}
      xDataKey="label"
      aspectRatio="4 / 1"
      className="min-h-72 sm:min-h-0"
      margin={{ top: 20, right: 24, bottom: 36, left: 72 }}
      revealSignature={period}
    >
      <SalesRevenueYAxis currency={currency} />
      <Grid horizontal numTicksRows={4} />
      <Bar dataKey="revenue" fill={chartCssVars.linePrimary} lineCap={2} />
      <BarXAxis
        maxLabels={period === "7d" ? 7 : 12}
        showAllLabels={period === "7d"}
      />
      <ChartTooltip
        showDatePill={true}
        showDots={false}
        content={({ point }) => {
          const label = String(point.label ?? "")
          const revenue = typeof point.revenue === "number" ? point.revenue : 0
          const orders = typeof point.orders === "number" ? point.orders : 0

          return (
            <div className="rounded-md px-3 py-2 text-sm shadow-sm">
              <div className="font-medium">{label}</div>
              <div className="mt-1 flex flex-col gap-1 text-white/50">
                <span>{formatPrice(revenue, currency)}</span>
                <span>{orders} ventas</span>
              </div>
            </div>
          )
        }}
      />
    </BarChart>
  )
}
