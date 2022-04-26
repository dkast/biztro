import React, { forwardRef } from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

export const ToolbarSwitch = React.forwardRef<
  HTMLButtonElement,
  SwitchPrimitive.SwitchProps
>(({ children, ...props }, forwardRef) => {
  return (
    <SwitchPrimitive.Root
      {...props}
      ref={forwardRef}
      className="relative h-5 w-10 rounded-full bg-gray-200 px-0.5 transition-colors radix-state-checked:bg-blue-500"
    >
      {children}
    </SwitchPrimitive.Root>
  )
})

ToolbarSwitch.displayName = "ToolbarSwitch"

export const ToolbarSwitchThumb = React.forwardRef<
  HTMLSpanElement,
  SwitchPrimitive.SwitchThumbProps
>((props, forwardRef) => {
  return (
    <SwitchPrimitive.Thumb
      ref={forwardRef}
      {...props}
      className="block h-4 w-4 rounded-full bg-white shadow transition-transform radix-state-checked:translate-x-5"
    />
  )
})

ToolbarSwitchThumb.displayName = "ToolbarSwitchThumb"
