import React, { type ReactNode } from "react"
import { PopoverContent } from "@radix-ui/react-popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { useMobile } from "@/lib/use-mobile"
import { cn } from "@/lib/utils"

function ComboBox({
  open,
  setOpen,
  children,
  trigger
}: {
  open?: boolean
  setOpen?: (open: boolean) => void
  children: ReactNode
  trigger: ReactNode
}) {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="h-[96%] gap-y-2">
          <Command>{children}</Command>
        </DrawerContent>
      </Drawer>
    )
  } else {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          className={cn(
            "z-50 w-72 rounded-md border border-gray-200 bg-white text-gray-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
          )}
        >
          <Command>{children}</Command>
        </PopoverContent>
      </Popover>
    )
  }
}

function ComboBoxFooter({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-gray-200 p-2 dark:border-gray-800",
        className
      )}
    >
      {children}
    </div>
  )
}

const ComboBoxInput = CommandInput
const ComboBoxList = CommandList
const ComboBoxEmpty = CommandEmpty
const ComboBoxItem = CommandItem
const ComboBoxGroup = CommandGroup

export {
  ComboBox,
  ComboBoxInput,
  ComboBoxList,
  ComboBoxEmpty,
  ComboBoxItem,
  ComboBoxGroup,
  ComboBoxFooter
}
