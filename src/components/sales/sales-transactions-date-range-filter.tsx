"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { es } from "react-day-picker/locale"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover-base"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  formatSalesClosingDateValue,
  parseSalesClosingDateValue
} from "@/lib/sales-closing-date"
import type { SalesTransactionQueryState } from "@/lib/sales-transactions"
import { cn } from "@/lib/utils"

type DateRangeValue = Pick<SalesTransactionQueryState, "range" | "from" | "to">

const shortDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short"
})

const fullDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric"
})

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function daysAgo(days: number) {
  const date = startOfToday()
  date.setDate(date.getDate() - days)
  return date
}

function customRange(from: Date, to: Date): DateRangeValue {
  return {
    range: "custom",
    from: formatSalesClosingDateValue(from),
    to: formatSalesClosingDateValue(to)
  }
}

const presets: { label: string; getValue: () => DateRangeValue }[] = [
  { label: "Hoy", getValue: () => customRange(startOfToday(), startOfToday()) },
  { label: "Ayer", getValue: () => customRange(daysAgo(1), daysAgo(1)) },
  {
    label: "Últimos 7 días",
    getValue: () => customRange(daysAgo(6), startOfToday())
  },
  {
    label: "Últimos 30 días",
    getValue: () => ({ range: "30d", from: "", to: "" })
  },
  {
    label: "Este mes",
    getValue: () => {
      const today = startOfToday()
      return customRange(
        new Date(today.getFullYear(), today.getMonth(), 1),
        today
      )
    }
  },
  {
    label: "Todas las fechas",
    getValue: () => ({ range: "all", from: "", to: "" })
  }
]

function isSameRange(a: DateRangeValue, b: DateRangeValue) {
  return a.range === b.range && a.from === b.from && a.to === b.to
}

function formatRangeLabel(value: DateRangeValue) {
  if (value.range === "all") return "Todas las fechas"
  if (value.range === "30d") return "Últimos 30 días"

  const preset = presets.find(item => isSameRange(item.getValue(), value))
  if (preset) return preset.label

  const from = parseSalesClosingDateValue(value.from)
  const to = parseSalesClosingDateValue(value.to)
  if (!from || !to) return "Seleccionar fechas"
  if (value.from === value.to) return fullDateFormatter.format(from)

  const fromLabel =
    from.getFullYear() === to.getFullYear()
      ? shortDateFormatter.format(from)
      : fullDateFormatter.format(from)
  return `${fromLabel} – ${fullDateFormatter.format(to)}`
}

function toDateRange(value: DateRangeValue): DateRange | undefined {
  if (value.range === "all") return undefined
  if (value.range === "30d") return { from: daysAgo(29), to: startOfToday() }

  const from = parseSalesClosingDateValue(value.from) ?? undefined
  const to = parseSalesClosingDateValue(value.to) ?? undefined
  return from ? { from, to } : undefined
}

export function SalesTransactionsDateRangeFilter({
  value,
  isInvalid,
  onChange
}: {
  value: DateRangeValue
  isInvalid?: boolean
  onChange: (value: DateRangeValue) => void
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<DateRange | undefined>(() =>
    toDateRange(value)
  )

  const applyValue = (nextValue: DateRangeValue) => {
    onChange(nextValue)
    setOpen(false)
  }

  const canApplyDraft = Boolean(draft?.from && draft?.to)

  return (
    <Popover
      open={open}
      onOpenChange={nextOpen => {
        if (nextOpen) setDraft(toDateRange(value))
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-invalid={isInvalid}
            className="h-8 justify-start font-normal"
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        <span className="truncate">{formatRangeLabel(value)}</span>
        <ChevronDownIcon
          data-icon="inline-end"
          className="text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0"
      >
        <div className="flex flex-col sm:flex-row">
          <div
            className="flex gap-1 overflow-x-auto border-b p-2 sm:w-40
              sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0"
          >
            {presets.map(preset => {
              const presetValue = preset.getValue()
              const isActive = isSameRange(presetValue, value)

              return (
                <Button
                  key={preset.label}
                  type="button"
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={isActive}
                  className={cn(
                    "shrink-0 justify-start font-normal",
                    isActive && "font-medium"
                  )}
                  onClick={() => applyValue(presetValue)}
                >
                  {preset.label}
                </Button>
              )
            })}
          </div>
          <div className="flex flex-col">
            <Calendar
              mode="range"
              numberOfMonths={isMobile ? 1 : 2}
              defaultMonth={
                isMobile
                  ? (draft?.to ?? startOfToday())
                  : new Date(
                      (draft?.to ?? startOfToday()).getFullYear(),
                      (draft?.to ?? startOfToday()).getMonth() - 1,
                      1
                    )
              }
              selected={draft}
              onSelect={setDraft}
              disabled={{ after: startOfToday() }}
              locale={es}
            />
            <Separator />
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="text-muted-foreground text-xs" aria-live="polite">
                {draft?.from && draft.to
                  ? formatRangeLabel(customRange(draft.from, draft.to))
                  : "Selecciona la fecha inicial y final"}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!canApplyDraft}
                  onClick={() => {
                    if (draft?.from && draft.to) {
                      applyValue(customRange(draft.from, draft.to))
                    }
                  }}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
