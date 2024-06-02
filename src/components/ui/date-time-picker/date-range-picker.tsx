"use client"

import React, { useRef, useState } from "react"
import {
  useDateRangePicker,
  useInteractOutside,
  type DateValue
} from "react-aria"
import {
  useDateRangePickerState,
  type DateRangePickerStateOptions
} from "react-stately"
import {
  endOfWeek,
  startOfMonth,
  startOfWeek,
  startOfYear,
  today
} from "@internationalized/date"
import { CalendarIcon } from "lucide-react"

import { RangeCalendar } from "@/components/ui/date-time-picker/range-calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { useForwardedRef } from "@/lib/use-forwarded-ref"
import { cn } from "@/lib/utils"
import { Button } from "../button"
import { DateField } from "./date-field"

const enum DateRangePickerPresets {
  TODAY = "today",
  YESTERDAY = "yesterday",
  THIS_WEEK = "this-week",
  LAST_WEEK = "last-week",
  THIS_MONTH = "this-month",
  LAST_MONTH = "last-month",
  // THIS_QUARTER = "this-quarter",
  // LAST_QUARTER = "last-quarter",
  THIS_YEAR = "this-year"
}

const presetButtons = [
  {
    label: "Hoy",
    value: DateRangePickerPresets.TODAY
  },
  {
    label: "Ayer",
    value: DateRangePickerPresets.YESTERDAY
  },
  {
    label: "Esta semana",
    value: DateRangePickerPresets.THIS_WEEK
  },
  {
    label: "Semana pasada",
    value: DateRangePickerPresets.LAST_WEEK
  },
  {
    label: "Este mes",
    value: DateRangePickerPresets.THIS_MONTH
  },
  {
    label: "Mes pasado",
    value: DateRangePickerPresets.LAST_MONTH
  },
  // {
  //   label: "Este trimestre",
  //   value: DateRangePickerPresets.THIS_QUARTER
  // },
  // {
  //   label: "Trimestre pasado",
  //   value: DateRangePickerPresets.LAST_QUARTER
  // },
  {
    label: "Este año",
    value: DateRangePickerPresets.THIS_YEAR
  }
]

const DateRangePicker = React.forwardRef<
  HTMLDivElement,
  DateRangePickerStateOptions<DateValue>
>((props, forwardedRef) => {
  const state = useDateRangePickerState(props)
  const ref = useForwardedRef(forwardedRef)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const [open, setOpen] = useState(false)

  const {
    groupProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps
  } = useDateRangePicker(props, state, ref)
  useInteractOutside({
    ref: contentRef,
    onInteractOutside: () => {
      setOpen(false)
    }
  })

  const handlePresetClick = (preset: DateRangePickerPresets) => {
    switch (preset) {
      case DateRangePickerPresets.TODAY:
        state.setValue({
          start: today("CST"),
          end: today("CST")
        })
        break
      case DateRangePickerPresets.YESTERDAY:
        state.setValue({
          start: today("CST").subtract({ days: 1 }),
          end: today("CST").subtract({ days: 1 })
        })
        break
      case DateRangePickerPresets.THIS_WEEK:
        state.setValue({
          start: startOfWeek(today("CST"), "en-MX"),
          end: today("CST")
        })
        break
      case DateRangePickerPresets.LAST_WEEK:
        state.setValue({
          start: startOfWeek(today("CST"), "en-MX").subtract({ weeks: 1 }),
          end: endOfWeek(today("CST"), "en-MX").subtract({ weeks: 1 })
        })
        break
      case DateRangePickerPresets.THIS_MONTH:
        state.setValue({
          start: startOfMonth(today("CST")),
          end: today("CST")
        })
        break
      case DateRangePickerPresets.LAST_MONTH:
        state.setValue({
          start: startOfMonth(today("CST")).subtract({ months: 1 }),
          end: startOfMonth(today("CST")).subtract({ days: 1 })
        })
        break
      case DateRangePickerPresets.THIS_YEAR:
        state.setValue({
          start: startOfYear(today("CST")),
          end: today("CST")
        })
        break
      default:
        break
    }
    setOpen(false)
  }

  return (
    <div
      {...groupProps}
      ref={ref}
      className={cn(
        groupProps.className,
        "flex w-[254px] items-center rounded-md ring-offset-white focus-within:ring-2 focus-within:ring-gray-950 focus-within:ring-offset-2"
      )}
    >
      <div className="flex h-8 grow flex-row items-center justify-between rounded-l-md border border-r-0 dark:border-gray-800">
        <DateField {...startFieldProps} />
        <span aria-hidden="true" className="text-gray-700 dark:text-gray-500">
          -
        </span>
        <DateField {...endFieldProps} />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            {...buttonProps}
            variant="outline"
            size="xs"
            className="rounded-l-none ring-0"
            disabled={props.isDisabled}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent ref={contentRef} className="w-full p-2 sm:p-4">
          <div {...dialogProps} className="flex space-y-3">
            <div className="flex flex-col pr-1 pt-2 sm:pr-2">
              {presetButtons.map(({ label, value }) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="xs"
                  onClick={() => handlePresetClick(value)}
                  className="text-left"
                >
                  {label}
                </Button>
              ))}
            </div>
            <RangeCalendar
              {...calendarProps}
              onChange={newDateRange => {
                if (props.onChange) {
                  props.onChange(newDateRange)
                }
                setOpen(false)
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})

DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
