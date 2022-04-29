import React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@radix-ui/react-icons"

export const ToolbarSelect = React.forwardRef<
  HTMLButtonElement,
  SelectPrimitive.SelectProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        ref={forwardedRef}
        className="inline-flex h-7 w-full items-center justify-between rounded bg-gray-100 px-1 pl-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <div className="truncate">
          <SelectPrimitive.Value />
        </div>
        <SelectPrimitive.Icon>
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content className="overflow-hidden rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center">
          <ChevronUpIcon />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-2">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center">
          <ChevronDownIcon />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  )
})

ToolbarSelect.displayName = "ToolbarSelect"

export const ToolbarSelectItem = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectItemProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Item
      {...props}
      ref={forwardedRef}
      className="relative flex h-6 cursor-default items-center rounded pl-7 text-sm focus:bg-blue-500 focus:text-white focus:outline-none"
    >
      <SelectPrimitive.ItemText className="truncate text-sm">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute left-0 inline-flex w-6 items-center justify-center">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
})

ToolbarSelectItem.displayName = "ToolbarSelectItem"
