"use client"

import { useRef } from "react"
import { useDateSegment } from "react-aria"
import {
  type DateFieldState,
  type DateSegment as IDateSegment
} from "react-stately"

import { cn } from "@/lib/utils"

interface DateSegmentProps {
  segment: IDateSegment
  state: DateFieldState
}

function DateSegment({ segment, state }: DateSegmentProps) {
  const ref = useRef(null)

  const {
    segmentProps: { ...segmentProps }
  } = useDateSegment(segment, state, ref)

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        "focus:rounded-[2px] focus:bg-blue-100 focus:text-blue-700 focus:outline-none",
        segment.type !== "literal" ? "px-[1px]" : "",
        segment.isPlaceholder ? "text-gray-500" : ""
      )}
    >
      {segment.text}
    </div>
  )
}

export { DateSegment }
