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
import { paymentMethodLabels } from "@/lib/types/payments"
import type { SalesCollectionChartBucket } from "@/lib/types/sales"

const collectionSeries = [
  { key: "CASH", label: paymentMethodLabels.CASH, fill: "var(--chart-1)" },
  { key: "CARD", label: paymentMethodLabels.CARD, fill: "var(--chart-2)" },
  {
    key: "TRANSFER",
    label: paymentMethodLabels.TRANSFER,
    fill: "var(--chart-3)"
  },
  { key: "CODI", label: paymentMethodLabels.CODI, fill: "var(--chart-4)" },
  {
    key: "VOUCHER",
    label: paymentMethodLabels.VOUCHER,
    fill: "var(--chart-5)"
  },
  {
    key: "LEGACY",
    label: "Pago histórico",
    fill: chartCssVars.lineSecondary
  }
] as const

type CollectionSeriesKey = (typeof collectionSeries)[number]["key"]

function CollectionsYAxis({ currency }: { currency: Currency }) {
  const yScale = useYScale()
  const ticks = yScale.ticks?.(4) ?? []
  if (ticks.length === 0) return null

  return (
    <g aria-hidden="true" pointerEvents="none">
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

CollectionsYAxis.displayName = "YAxis"

function getCollectionValue(
  point: Record<string, unknown>,
  key: CollectionSeriesKey
) {
  return typeof point[key] === "number" ? point[key] : 0
}

export function SalesCollectionsChart({
  chart,
  currency,
  period
}: {
  chart: SalesCollectionChartBucket[]
  currency: Currency
  period: SalesDashboardPeriod
}) {
  const activeSeries = collectionSeries.filter(series =>
    chart.some(bucket => bucket[series.key] > 0)
  )

  if (activeSeries.length === 0) {
    return (
      <Empty className="min-h-72 rounded-none border-0 p-6 md:p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BarChart3 />
          </EmptyMedia>
          <EmptyTitle>Sin cobros en este periodo</EmptyTitle>
          <EmptyDescription>
            Los cobros y abonos aparecerán aquí cuando se registren.
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
        <CollectionsYAxis currency={currency} />
        <Grid horizontal numTicksRows={4} />
        {activeSeries.map(series => (
          <Bar
            key={series.key}
            dataKey={series.key}
            fill={series.fill}
            lineCap={3}
            stackGap={2}
          />
        ))}
        <BarXAxis
          maxLabels={period === "7d" ? 7 : 12}
          showAllLabels={period === "7d"}
        />
        <ChartTooltip
          showDatePill={true}
          showDots={false}
          content={({ point }) => {
            const total = activeSeries.reduce(
              (sum, series) => sum + getCollectionValue(point, series.key),
              0
            )

            return (
              <div className="rounded-md px-3 py-2 text-sm shadow-sm">
                <div className="font-medium">{String(point.label ?? "")}</div>
                <div className="mt-1 flex flex-col gap-1">
                  <span className="font-medium">
                    Total: {formatPrice(total, currency)}
                  </span>
                  {activeSeries.map(series => {
                    const amount = getCollectionValue(point, series.key)
                    if (amount <= 0) return null

                    return (
                      <span key={series.key} className="text-gray-400">
                        {series.label}: {formatPrice(amount, currency)}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          }}
        />
      </BarChart>
      <div className="flex flex-wrap gap-x-4 gap-y-2 px-1 text-xs">
        {activeSeries.map(series => (
          <span
            key={series.key}
            className="text-muted-foreground inline-flex items-center gap-1.5"
          >
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: series.fill }}
            />
            {series.label}
          </span>
        ))}
      </div>
    </div>
  )
}
