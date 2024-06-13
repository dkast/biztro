import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export default function SideSection({
  title,
  children
}: {
  title: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <Collapsible className="w-full text-sm" open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between border-b px-4 py-2 text-left dark:border-gray-800">
        <span className="text-sm font-medium">{title}</span>
        {open ? (
          <ChevronUp className="size-3.5 text-gray-500" />
        ) : (
          <ChevronDown className="size-3.5 text-gray-500" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn("flex flex-col gap-y-2", open && "p-4")}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
