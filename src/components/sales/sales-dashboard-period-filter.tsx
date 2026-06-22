"use client"

import { parseAsStringEnum, useQueryState } from "nuqs"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  defaultSalesDashboardPeriod,
  isSalesDashboardPeriod,
  salesDashboardPeriodOptions,
  salesDashboardPeriodValues
} from "@/lib/sales-dashboard-period"
import { cn } from "@/lib/utils"

const salesDashboardPeriodQueryState = parseAsStringEnum([
  ...salesDashboardPeriodValues
])
  .withDefault(defaultSalesDashboardPeriod)
  .withOptions({
    shallow: false,
    scroll: false
  })

export function SalesDashboardPeriodFilter({
  className,
  inline = false,
  label = "Periodo acumulado"
}: {
  className?: string
  inline?: boolean
  label?: string
}) {
  const [period, setPeriod] = useQueryState(
    "period",
    salesDashboardPeriodQueryState
  )

  return (
    <div
      className={cn(
        inline
          ? `flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row
            sm:items-center`
          : "flex flex-col gap-2",
        className
      )}
    >
      <p
        className="text-muted-foreground text-xs font-medium tracking-[0.01em]
          sm:text-right"
      >
        {label}
      </p>
      <ToggleGroup
        type="single"
        value={period}
        onValueChange={value => {
          if (isSalesDashboardPeriod(value)) {
            void setPeriod(value)
          }
        }}
        className="bg-muted grid w-full grid-cols-2 gap-1 rounded-lg p-[3px]
          sm:inline-flex sm:w-auto sm:flex-nowrap"
        variant="default"
        size="sm"
      >
        {salesDashboardPeriodOptions.map(option => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={`Filtrar por ${option.label}`}
            className="text-foreground/70 hover:text-foreground
              data-[state=on]:bg-background data-[state=on]:text-foreground
              justify-center rounded-md border border-transparent px-3
              shadow-none hover:bg-transparent data-[state=on]:shadow-sm"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
