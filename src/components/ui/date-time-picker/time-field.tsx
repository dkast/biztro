"use client"

import { useRef } from "react"
import {
  useLocale,
  useTimeField,
  type AriaTimeFieldProps,
  type TimeValue
} from "react-aria"
import { useTimeFieldState } from "react-stately"

import { cn } from "@/lib/utils"
import { DateSegment } from "./date-segment"

function TimeField(props: AriaTimeFieldProps<TimeValue>) {
  const ref = useRef<HTMLDivElement | null>(null)

  const { locale } = useLocale()
  const state = useTimeFieldState({
    ...props,
    locale
  })
  const {
    fieldProps: { ...fieldProps }
  } = useTimeField(props, state, ref)

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        // input.tsx styles
        "flex h-9 w-full min-w-0 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-gray-900 selection:text-gray-50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-950 placeholder:text-gray-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-800 dark:bg-gray-200/30 dark:dark:bg-gray-800/30 dark:selection:bg-gray-50 dark:selection:text-gray-900 dark:file:text-gray-50 dark:placeholder:text-gray-400",
        "focus-visible:border-gray-950 focus-visible:ring-[3px] focus-visible:ring-gray-950/50 dark:focus-visible:border-gray-300 dark:focus-visible:ring-gray-300/50",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:border-red-900 dark:aria-invalid:ring-red-500/40 dark:dark:aria-invalid:ring-red-900/40",
        props.isDisabled ? "cursor-not-allowed opacity-50" : ""
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  )
}

export { TimeField }
