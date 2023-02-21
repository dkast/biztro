import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import React from "react"

interface TooltipProps extends TooltipPrimitive.TooltipContentProps {
  children: React.ReactNode
  content: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Tooltip = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side="top"
          align="center"
          {...props}
          className="z-[100] rounded bg-zinc-900 px-2 py-1 text-xs text-white"
        >
          {content}
          <TooltipPrimitive.Arrow offset={5} width={11} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
