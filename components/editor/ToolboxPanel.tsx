import React, { useState } from "react"
import * as Collapsible from "@radix-ui/react-collapsible"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid"

interface ToolboxPanelProps {
  children: React.ReactNode
  title: string
}

const ToolboxPanel = ({ children, title }: ToolboxPanelProps): JSX.Element => {
  const [open, setOpen] = useState(true)
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="flex justify-between border-b p-2">
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
      <Collapsible.CollapsibleContent className="flex flex-col gap-2 px-2 pt-2">
        {children}
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  )
}

export default ToolboxPanel
