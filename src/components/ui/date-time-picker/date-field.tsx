"use client"

import { useRef } from "react"
import {
  useDateField,
  useLocale,
  type AriaDatePickerProps,
  type DateValue
} from "react-aria"
import { useDateFieldState } from "react-stately"
import { createCalendar } from "@internationalized/date"

import { cn } from "@/lib/utils"
import { DateSegment } from "./date-segment"

function DateField(props: AriaDatePickerProps<DateValue>) {
  const ref = useRef<HTMLDivElement | null>(null)

  const { locale } = useLocale()
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  })
  const { fieldProps } = useDateField(props, state, ref)

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        "inline-flex h-10 flex-1 items-center rounded-l-md bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
        props.isDisabled ? "cursor-not-allowed opacity-50" : ""
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
      {state.validationState === "invalid" && (
        <span aria-hidden="true">🚫</span>
      )}
    </div>
  )
}

export { DateField }
