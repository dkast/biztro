"use client"

import { Clock } from "lucide-react"

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
import type { SalesClosingHourlyBucket } from "@/lib/types/sales"

function SalesClosingHourlyYAxis() {
  const yScale = useYScale()

  const ticks = yScale.ticks?.(3) ?? []

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
          {tick}
        </text>
      ))}
    </g>
  )
}

export function SalesClosingHourlyChart({
  hourly,
  currency
}: {
  hourly: SalesClosingHourlyBucket[]
  currency: Currency
}) {
  const hasSales = hourly.some(bucket => bucket.todayOrders > 0)

  if (!hasSales) {
    return (
      <Empty className="min-h-40 rounded-none border-0 p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock />
          </EmptyMedia>
          <EmptyTitle>Sin ventas por hora</EmptyTitle>
          <EmptyDescription>
            Cuando haya ventas verás las horas con más actividad.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-2">
      <BarChart
        data={hourly}
        xDataKey="label"
        aspectRatio="5 / 1"
        className="min-h-40 sm:min-h-0"
        margin={{ top: 16, right: 12, bottom: 28, left: 32 }}
      >
        <SalesClosingHourlyYAxis />
        <Grid horizontal numTicksRows={3} />
        <Bar
          dataKey="todayOrders"
          fill={chartCssVars.linePrimary}
          lineCap={2}
        />
        <BarXAxis showAllLabels maxLabels={hourly.length} />
        <ChartTooltip
          showDatePill={false}
          showDots={false}
          content={({ point }) => {
            const label = String(point.label ?? "")
            const todayOrders =
              typeof point.todayOrders === "number" ? point.todayOrders : 0
            const todayRevenue =
              typeof point.todayRevenue === "number" ? point.todayRevenue : 0

            return (
              <div className="rounded-md px-3 py-2 text-sm shadow-sm">
                <div className="font-medium">{label}</div>
                <div className="mt-1 flex flex-col gap-1 text-white/50">
                  <span>
                    Hoy: {todayOrders} ventas ·{" "}
                    {formatPrice(todayRevenue, currency)}
                  </span>
                </div>
              </div>
            )
          }}
        />
      </BarChart>
    </div>
  )
}
