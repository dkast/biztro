import React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { motion } from "framer-motion"

export const ToolbarDropdown = DropdownMenuPrimitive.Root
export const ToolbarDropdownTrigger = DropdownMenuPrimitive.Trigger

const dropdown = {
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
    scale: 0.75,
    transition: {
      ease: "easeIn",
      duration: 0.075
    }
  }
}

export const ToolbarDropdownContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuContentProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.Content {...props} ref={forwardedRef} asChild>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={dropdown}
        className="z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        {children}
      </motion.div>
    </DropdownMenuPrimitive.Content>
  )
})

ToolbarDropdownContent.displayName = "ToolbarDropdownContent"

export const ToolbarDropdownItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuItemProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.Item
      {...props}
      ref={forwardedRef}
      className="block cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:outline-none"
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
})

ToolbarDropdownItem.displayName = "ToolbarDropdownItem"
