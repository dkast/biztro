"use client"

import React, { useRef, useState } from "react"
import {
  useButton,
  useDatePicker,
  useInteractOutside,
  type DateValue
} from "react-aria"
import { useDatePickerState, type DatePickerStateOptions } from "react-stately"
import { CalendarIcon } from "lucide-react"

import { useForwardedRef } from "@/lib/use-forwarded-ref"
import { cn } from "@/lib/utils"
import { Button } from "../button"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { Calendar } from "./calendar"
import { DateField } from "./date-field"
import { TimeField } from "./time-field"

const DateTimePicker = React.forwardRef<
  HTMLDivElement,
  DatePickerStateOptions<DateValue>
>((props, forwardedRef) => {
  const ref = useForwardedRef(forwardedRef)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const [open, setOpen] = useState(false)

  const state = useDatePickerState(props)
  const {
    groupProps,
    fieldProps,
    buttonProps: _buttonProps,
    dialogProps,
    calendarProps
  } = useDatePicker(props, state, ref)
  const { buttonProps } = useButton(_buttonProps, buttonRef)
  useInteractOutside({
    ref: contentRef,
    onInteractOutside: _e => {
      setOpen(false)
    }
  })

  return (
    <div
      {...groupProps}
      ref={ref}
      className={cn(
        groupProps.className,
        "flex items-center rounded-md ring-offset-white focus-within:ring-2 focus-within:ring-gray-950 focus-within:ring-offset-2"
      )}
    >
      <div className="flex h-10 grow flex-row items-center rounded-l-md border border-r-0 dark:border-gray-800">
        <DateField {...fieldProps} />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            {...buttonProps}
            variant="outline"
            className="rounded-l-none"
            disabled={props.isDisabled}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent ref={contentRef} className="w-full">
          <div {...dialogProps} className="space-y-3">
            <Calendar {...calendarProps} />
            {!!state.hasTime && (
              <TimeField
                value={state.timeValue}
                onChange={state.setTimeValue}
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})

DateTimePicker.displayName = "DateTimePicker"

export { DateTimePicker }
