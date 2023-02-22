import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid"
import * as Collapsible from "@radix-ui/react-collapsible"
import React, { useState } from "react"

interface ToolboxPanelProps {
  children: React.ReactNode
  title: string
}

const ToolboxPanel = ({ children, title }: ToolboxPanelProps): JSX.Element => {
  const [open, setOpen] = useState(true)
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="flex justify-between border-b p-3">
        <h3 className="text-sm">{title}</h3>
        <Collapsible.Trigger asChild>
          <button type="button">
            {open ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.CollapsibleContent className="flex flex-col px-2">
        <div className="py-3">{children}</div>
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  )
}

export default ToolboxPanel
