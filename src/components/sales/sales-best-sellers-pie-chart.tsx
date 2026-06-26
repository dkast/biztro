"use client"

import { useMemo, useState } from "react"
import NumberFlow from "@number-flow/react"

import { PieChart } from "@/components/charts/pie-chart"
import { pieCssVars } from "@/components/charts/pie-context"
import { PieSlice } from "@/components/charts/pie-slice"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatPrice, type Currency } from "@/lib/currency"
import type { SalesBestSeller } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

const bestSellerMetricOptions = [
  {
    value: "quantity",
    label: "Unidades"
  },
  {
    value: "revenue",
    label: "Ingresos"
  }
] as const

const bestSellerSegmentColors = [
  pieCssVars.slice1,
  pieCssVars.slice2,
  pieCssVars.slice3,
  pieCssVars.slice4,
  pieCssVars.slice5,
  `color-mix(in oklab, ${pieCssVars.slice1} 76%, ${pieCssVars.background})`,
  `color-mix(in oklab, ${pieCssVars.slice2} 76%, ${pieCssVars.background})`,
  `color-mix(in oklab, ${pieCssVars.slice3} 76%, ${pieCssVars.background})`,
  `color-mix(in oklab, ${pieCssVars.slice4} 76%, ${pieCssVars.background})`,
  `color-mix(in oklab, ${pieCssVars.slice5} 76%, ${pieCssVars.background})`
] as const

type BestSellerMetric = (typeof bestSellerMetricOptions)[number]["value"]

type BestSellerChartDatum = SalesBestSeller & {
  color: string
  label: string
  value: number
  share: number
}

type SalesBestSellersPieChartProps = {
  bestSellers: SalesBestSeller[]
  currency: Currency
}

function formatMetricValue({
  value,
  metric,
  currency,
  locales,
  withCurrencyCode = true
}: {
  value: number
  metric: BestSellerMetric
  currency: Currency
  locales: string
  withCurrencyCode?: boolean
}) {
  if (metric === "revenue") {
    if (withCurrencyCode) {
      return formatPrice(value, currency)
    }

    return new Intl.NumberFormat(locales, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  return `${new Intl.NumberFormat(locales, {
    maximumFractionDigits: 0
  }).format(value)} unidades`
}

function formatMetricCompactValue({
  value,
  metric,
  currency,
  locales
}: {
  value: number
  metric: BestSellerMetric
  currency: Currency
  locales: string
}) {
  if (metric === "revenue") {
    return new Intl.NumberFormat(locales, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  return new Intl.NumberFormat(locales, {
    maximumFractionDigits: 0
  }).format(value)
}

function formatShare(share: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: share < 0.1 ? 1 : 0,
    maximumFractionDigits: 1
  }).format(share)
}

export function SalesBestSellersPieChart({
  bestSellers,
  currency
}: SalesBestSellersPieChartProps) {
  const [metric, setMetric] = useState<BestSellerMetric>("quantity")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const locales = currency === "MXN" ? "es-MX" : "en-US"

  const chartState = useMemo(() => {
    const segments = bestSellers.slice(0, 10).map((item, index) => ({
      ...item,
      color: bestSellerSegmentColors[index] ?? bestSellerSegmentColors[0],
      label: item.productName,
      value: metric === "quantity" ? item.quantity : item.revenue
    }))

    const totalValue = segments.reduce((sum, item) => sum + item.value, 0)
    const averageValue = segments.length > 0 ? totalValue / segments.length : 0

    const rankedSegments: BestSellerChartDatum[] = segments.map(item => ({
      ...item,
      share: totalValue > 0 ? item.value / totalValue : 0
    }))

    const leadingSegment =
      rankedSegments.length > 0
        ? rankedSegments.reduce((leader, segment) =>
            segment.value > leader.value ? segment : leader
          )
        : null

    return {
      averageValue,
      totalValue,
      leadingSegment,
      segments: rankedSegments
    }
  }, [bestSellers, metric])

  const activeMetricLabel = metric === "quantity" ? "Unidades" : "Ingresos"
  const activeSegment =
    hoveredIndex === null ? null : (chartState.segments[hoveredIndex] ?? null)
  const centerValue = activeSegment?.value ?? chartState.totalValue
  const centerTitle = activeSegment?.productName ?? activeMetricLabel
  const centerMeta = activeSegment
    ? metric === "revenue"
      ? `${activeSegment.quantity} unidades · ${formatShare(activeSegment.share)}`
      : `${formatPrice(activeSegment.revenue, currency)} · ${formatShare(
          activeSegment.share
        )}`
    : `Promedio ${formatMetricCompactValue({
        value: chartState.averageValue,
        metric,
        currency,
        locales
      })}${metric === "quantity" ? " u." : ""}`

  return (
    <div
      className="border-border/70 from-background via-background to-muted/20
        relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br p-4
        sm:p-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-32
          rounded-full
          bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 -bottom-12 h-40 w-40
          rounded-full
          bg-[radial-gradient(circle,rgba(52,211,153,0.16),transparent_68%)]"
      />

      <div className="relative flex flex-col gap-5">
        <div
          className="flex flex-col items-start gap-3 sm:flex-row sm:items-center
            sm:justify-between"
        >
          <div className="space-y-1">
            <p
              className="text-muted-foreground text-[0.7rem] font-medium
                tracking-[0.24em] uppercase"
            >
              Distribución top 10
            </p>
            <h3 className="text-sm font-semibold text-balance">
              Participación por producto
            </h3>
          </div>

          <ToggleGroup
            type="single"
            value={metric}
            onValueChange={value => {
              if (value === "quantity" || value === "revenue") {
                setMetric(value)
                setHoveredIndex(null)
              }
            }}
            aria-label="Cambiar métrica del gráfico de productos más vendidos"
            className="bg-muted/70 border-border/60 inline-flex gap-1 rounded-xl
              border p-1"
            variant="default"
            size="sm"
          >
            {bestSellerMetricOptions.map(option => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={`Mostrar ${option.label.toLowerCase()}`}
                className="text-foreground/70 hover:text-foreground
                  data-[state=on]:bg-background data-[state=on]:text-foreground
                  rounded-lg border border-transparent px-3 shadow-none
                  hover:bg-transparent data-[state=on]:shadow-sm"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div
          className="grid gap-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]
            lg:items-center"
        >
          <div className="space-y-4">
            <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
              <div
                aria-hidden="true"
                className="absolute inset-3 rounded-full opacity-45 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in oklab, var(--chart-1) 38%, transparent), transparent 68%)"
                }}
              />
              <PieChart
                key={metric}
                className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.16)]"
                data={chartState.segments}
                innerRadius={76}
                cornerRadius={12}
                hoverOffset={12}
                hoveredIndex={hoveredIndex}
                onHoverChange={setHoveredIndex}
                padAngle={0.016}
              >
                {chartState.segments.map((segment, index) => (
                  <PieSlice
                    key={`${segment.productName}-${metric}`}
                    color={segment.color}
                    index={index}
                    hoverEffect="translate"
                  />
                ))}
              </PieChart>

              <div
                className="border-border/70 bg-background/85 absolute
                  inset-[22%] flex flex-col items-center justify-center
                  rounded-full border px-4 text-center
                  shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_50px_rgba(0,0,0,0.16)]
                  backdrop-blur-sm"
              >
                <p
                  className="text-muted-foreground max-w-full truncate
                    text-[0.7rem] font-medium tracking-wide"
                >
                  {centerTitle}
                </p>
                <NumberFlow
                  aria-label={formatMetricValue({
                    value: centerValue,
                    metric,
                    currency,
                    locales
                  })}
                  className="text-foreground mt-2 text-2xl leading-none
                    font-semibold tabular-nums sm:text-3xl"
                  value={centerValue}
                  locales={locales}
                  format={
                    metric === "revenue"
                      ? {
                          style: "currency",
                          currency,
                          currencyDisplay: "symbol",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2
                        }
                      : {
                          maximumFractionDigits: 0
                        }
                  }
                />
                <p className="text-muted-foreground mt-2 text-xs">
                  {centerMeta}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <span
                className="border-border/70 bg-background/70 rounded-full border
                  px-3 py-1 text-xs font-medium"
              >
                Basado en los 10 productos del ranking
              </span>
              {chartState.leadingSegment && (
                <span
                  className="rounded-full border border-emerald-400/20
                    bg-emerald-500/8 px-3 py-1 text-xs font-medium
                    text-emerald-700 dark:text-emerald-300"
                >
                  Lidera {chartState.leadingSegment.productName} ·{" "}
                  {formatShare(chartState.leadingSegment.share)}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {chartState.segments.map((segment, index) => {
              const isActive = hoveredIndex === index
              const isMuted = hoveredIndex !== null && hoveredIndex !== index
              const secondaryValue =
                metric === "revenue"
                  ? `${segment.quantity} unidades`
                  : formatPrice(segment.revenue, currency)

              return (
                <div
                  key={segment.productName}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={cn(
                    `flex items-start gap-3 rounded-2xl border px-3 py-2.5
                    text-left transition`,
                    index < 3
                      ? `border-border/70 from-background via-background
                        to-muted/30 bg-gradient-to-r`
                      : "border-border/60 bg-background/65",
                    isActive &&
                      `border-foreground/15 bg-background
                      shadow-[0_18px_30px_rgba(0,0,0,0.08)]`,
                    isMuted && "opacity-55"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {segment.productName}
                      </p>
                      <span
                        className="text-muted-foreground text-[0.7rem]
                          font-semibold tabular-nums"
                      >
                        #{index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium tabular-nums">
                      {formatMetricValue({
                        value: segment.value,
                        metric,
                        currency,
                        locales
                      })}
                    </p>
                    <div
                      className="text-muted-foreground mt-1 flex items-center
                        gap-2 text-xs tabular-nums"
                    >
                      <span>{secondaryValue}</span>
                      <span className="text-border">•</span>
                      <span>{formatShare(segment.share)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
