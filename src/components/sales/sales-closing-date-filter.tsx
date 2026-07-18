"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  formatSalesClosingDateLabel,
  formatSalesClosingDateValue,
  parseSalesClosingDateValue,
  resolveSalesClosingDateValue
} from "@/lib/sales-closing-date"
import { cn } from "@/lib/utils"

export function SalesClosingDateFilter({
  className,
  label = "Fecha",
  selectedDateValue
}: {
  className?: string
  label?: string
  selectedDateValue: string
}) {
  const queryState = React.useMemo(
    () =>
      parseAsString.withDefault(selectedDateValue).withOptions({
        shallow: false,
        scroll: false
      }),
    [selectedDateValue]
  )
  const [dateValue, setDateValue] = useQueryState("date", queryState)

  const resolvedDateValue = React.useMemo(
    () => resolveSalesClosingDateValue(dateValue, selectedDateValue),
    [dateValue, selectedDateValue]
  )

  const selectedDate = React.useMemo(
    () => parseSalesClosingDateValue(resolvedDateValue),
    [resolvedDateValue]
  )

  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (dateValue !== resolvedDateValue) {
      void setDateValue(resolvedDateValue)
    }
  }, [dateValue, resolvedDateValue, setDateValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-empty={!selectedDate}
          aria-label={label}
          className={cn(
            `data-[empty=true]:text-muted-foreground w-full justify-start
            text-left font-normal sm:w-[180px]`,
            className
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          <span className="truncate">
            {selectedDate
              ? formatSalesClosingDateLabel(resolvedDateValue)
              : "Seleccionar fecha"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          className="rounded-lg"
          selected={selectedDate ?? undefined}
          defaultMonth={selectedDate ?? new Date()}
          disabled={date => date > new Date()}
          onSelect={date => {
            if (!date) return

            const nextValue = formatSalesClosingDateValue(date)
            void setDateValue(nextValue)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
