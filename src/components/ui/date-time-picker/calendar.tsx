"use client"

import React, { useMemo } from "react"
import {
  useButton,
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  useLocale,
  type CalendarProps,
  type DateValue
} from "react-aria"
import { useCalendarState, type CalendarState } from "react-stately"
import {
  isToday as _isToday,
  createCalendar,
  getLocalTimeZone,
  getWeeksInMonth,
  type CalendarDate
} from "@internationalized/date"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "../button"

function Calendar(props: CalendarProps<DateValue>) {
  const prevButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const nextButtonRef = React.useRef<HTMLButtonElement | null>(null)

  const { locale } = useLocale()
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar
  })
  const {
    calendarProps,
    prevButtonProps: _prevButtonProps,
    nextButtonProps: _nextButtonProps,
    title
  } = useCalendar(props, state)
  const { buttonProps: prevButtonProps } = useButton(
    _prevButtonProps,
    prevButtonRef
  )
  const { buttonProps: nextButtonProps } = useButton(
    _nextButtonProps,
    nextButtonRef
  )

  return (
    <div {...calendarProps} className="space-y-4">
      <div className="relative flex items-center justify-center pt-1">
        <Button
          {...prevButtonProps}
          ref={prevButtonRef}
          variant={"outline"}
          className={cn(
            "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">{title}</div>
        <Button
          {...nextButtonProps}
          ref={nextButtonRef}
          variant={"outline"}
          className={cn(
            "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <CalendarGrid state={state} />
    </div>
  )
}

interface CalendarGridProps {
  state: CalendarState
}

function CalendarGrid({ state, ...props }: CalendarGridProps) {
  const { locale } = useLocale()
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state)

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale)

  return (
    <table
      {...gridProps}
      className={cn(gridProps.className, "w-full border-collapse space-y-1")}
    >
      <thead {...headerProps}>
        <tr className="flex">
          {weekDays.map((day, index) => (
            <th
              className="w-9 rounded-md text-[0.8rem] font-normal text-gray-500"
              key={index}
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map(weekIndex => (
          <tr className="mt-2 flex w-full" key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) =>
                date ? (
                  <CalendarCell key={i} state={state} date={date} />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface CalendarCellProps {
  state: CalendarState
  date: CalendarDate
}

function CalendarCell({ state, date }: CalendarCellProps) {
  const ref = React.useRef<HTMLButtonElement | null>(null)
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate
  } = useCalendarCell({ date }, state, ref)

  const isToday = useMemo(() => {
    const timezone = getLocalTimeZone()
    return _isToday(date, timezone)
  }, [date])

  return (
    <td
      {...cellProps}
      className={cn(
        cellProps.className,
        "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-950 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
      )}
    >
      <Button
        {...buttonProps}
        type="button"
        variant={"ghost"}
        ref={ref}
        className={cn(
          buttonProps.className,
          "h-9 w-9",
          isToday
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            : "",
          isSelected
            ? "bg-gray-900 text-gray-50 hover:bg-gray-900 hover:text-gray-50 focus:bg-gray-900 focus:text-gray-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50 dark:hover:text-gray-900 dark:focus:bg-gray-50 dark:focus:text-gray-900"
            : "",
          isOutsideVisibleRange
            ? "text-gray-500 opacity-50 dark:text-gray-400"
            : "",
          isDisabled ? "text-gray-500 opacity-50 dark:text-gray-400" : ""
        )}
      >
        {formattedDate}
      </Button>
    </td>
  )
}

export { Calendar }
