import React, { forwardRef } from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

export const ToolbarDropdown = DropdownMenuPrimitive.Root
export const ToolbarDropdownTrigger = DropdownMenuPrimitive.Trigger

export const ToolbarDropdownContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuContentProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.Content
      ref={forwardedRef}
      className="mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      {children}
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
