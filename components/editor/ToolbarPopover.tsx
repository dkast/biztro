// your-popover.js

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { motion } from "framer-motion"
import React from "react"

export const ToolbarPopover = PopoverPrimitive.Root
export const ToolbarPopoverTrigger = PopoverPrimitive.Trigger

const popover = {
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ease: "easeOut",
      duration: 0.1
    }
  },
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      ease: "easeIn",
      duration: 0.075
    }
  }
}

export const ToolbarPopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverPrimitive.PopoverContentProps
>(({ children, ...props }, forwardedRef) => (
  <PopoverPrimitive.Content
    sideOffset={5}
    {...props}
    ref={forwardedRef}
    asChild
    className="z-[90]"
  >
    <motion.div initial="hidden" animate="visible" variants={popover}>
      {children}
      {/* <PopoverPrimitive.Arrow className="fill-white" /> */}
    </motion.div>
  </PopoverPrimitive.Content>
))

ToolbarPopoverContent.displayName = "ToolbarPopoverContent"
