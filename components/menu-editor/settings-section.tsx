import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"

export default function SettingsSection({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <Collapsible className="w-full text-sm" open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between border-b px-4 py-2 text-left">
        <span>{title}</span>
        {open ? (
          <ChevronUp className="size-3.5 text-gray-500" />
        ) : (
          <ChevronDown className="size-3.5 text-gray-500" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="gap-y-2 p-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
