// your-popover.js
import React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

export const ToolbarPopover = PopoverPrimitive.Root
export const ToolbarPopoverTrigger = PopoverPrimitive.Trigger

export const ToolbarPopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverPrimitive.PopoverContentProps
>(({ children, ...props }, forwardedRef) => (
  <PopoverPrimitive.Content sideOffset={5} {...props} ref={forwardedRef}>
    {children}
  </PopoverPrimitive.Content>
))

ToolbarPopoverContent.displayName = "ToolbarPopoverContent"
