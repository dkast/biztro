"use client"

import * as React from "react"
import { OTPInput, type SlotProps } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof OTPInput> & {
  ref: React.RefObject<React.ElementRef<typeof OTPInput>>
}) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2", className)}
    {...props}
  />
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref: React.RefObject<React.ElementRef<"div">>
}) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = ({
  ref,
  char,
  hasFakeCaret,
  isActive,
  className,
  ...props
}) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-gray-200 text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md dark:border-gray-800",
        isActive &&
          "z-10 ring-2 ring-gray-950 ring-offset-white dark:ring-gray-300 dark:ring-offset-gray-950",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-gray-950 duration-1000 dark:bg-gray-50" />
        </div>
      )}
    </div>
  )
}
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = ({
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref: React.RefObject<React.ElementRef<"div">>
}) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
