"use client"

import { useMemo, useState } from "react"
import NumberFlow from "@number-flow/react"
import { WalletCards } from "lucide-react"

import { PieChart } from "@/components/charts/pie-chart"
import { pieCssVars } from "@/components/charts/pie-context"
import { PieSlice } from "@/components/charts/pie-slice"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { formatPrice, type Currency } from "@/lib/currency"
import { paymentMethodLabels, type PaymentMethod } from "@/lib/types/payments"
import type { SalesCollectionChartBucket } from "@/lib/types/sales"

const collectionSegmentDefinitions = [
  { key: "CASH", label: paymentMethodLabels.CASH, color: pieCssVars.slice1 },
  { key: "CARD", label: paymentMethodLabels.CARD, color: pieCssVars.slice2 },
  {
    key: "TRANSFER",
    label: paymentMethodLabels.TRANSFER,
    color: pieCssVars.slice3
  },
  { key: "CODI", label: paymentMethodLabels.CODI, color: pieCssVars.slice4 },
  {
    key: "VOUCHER",
    label: paymentMethodLabels.VOUCHER,
    color: pieCssVars.slice5
  },
  {
    key: "LEGACY",
    label: "Pago histórico",
    color: `color-mix(in oklab, ${pieCssVars.slice1} 72%, ${pieCssVars.background})`
  }
] as const

type CollectionSegmentKey = PaymentMethod | "LEGACY"

function formatShare(share: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(share)
}

export function SalesClosingCollectionsPieChart({
  chart,
  currency
}: {
  chart: SalesCollectionChartBucket[]
  currency: Currency
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const chartState = useMemo(() => {
    const totals = collectionSegmentDefinitions.map(segment => ({
      ...segment,
      value: chart.reduce(
        (total, bucket) => total + bucket[segment.key as CollectionSegmentKey],
        0
      )
    }))
    const totalValue = totals.reduce(
      (total, segment) => total + segment.value,
      0
    )

    return {
      totalValue,
      segments: totals
        .filter(segment => segment.value > 0)
        .map(segment => ({
          ...segment,
          share: totalValue > 0 ? segment.value / totalValue : 0
        }))
    }
  }, [chart])

  if (chartState.totalValue <= 0) {
    return (
      <Empty className="min-h-40 rounded-none border-0 p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WalletCards />
          </EmptyMedia>
          <EmptyTitle>Sin cobros en esta fecha</EmptyTitle>
          <EmptyDescription>
            Los cobros y abonos aparecerán aquí cuando se registren.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const activeSegment =
    hoveredIndex === null ? null : (chartState.segments[hoveredIndex] ?? null)
  const centerValue = activeSegment?.value ?? chartState.totalValue
  const centerLabel = activeSegment?.label ?? "Total cobrado"
  const centerMeta = activeSegment
    ? `${formatShare(activeSegment.share)} del total`
    : `${chartState.segments.length} métodos de cobro`

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-52">
        <PieChart
          data={chartState.segments}
          innerRadius={64}
          cornerRadius={3}
          hoverOffset={8}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          padAngle={0.016}
        >
          {chartState.segments.map((segment, index) => (
            <PieSlice
              key={segment.key}
              color={segment.color}
              index={index}
              animate={false}
              hoverEffect="translate"
            />
          ))}
        </PieChart>

        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-[22%] flex flex-col
            items-center justify-center rounded-full px-3 text-center"
        >
          <p
            className="text-muted-foreground max-w-full truncate text-xs
              font-medium"
          >
            {centerLabel}
          </p>
          <NumberFlow
            aria-label={formatPrice(centerValue, currency)}
            className="text-foreground mt-2 text-xl leading-none font-semibold
              tabular-nums sm:text-2xl"
            value={centerValue}
            locales={currency === "MXN" ? "es-MX" : "en-US"}
            format={{
              style: "currency",
              currency,
              currencyDisplay: "symbol",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }}
          />
          <p className="text-muted-foreground mt-2 text-xs">{centerMeta}</p>
        </div>
      </div>
    </div>
  )
}
