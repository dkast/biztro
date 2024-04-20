import { Info } from "lucide-react"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card"

export default function InfoHelper({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Info className="mx-1.5 my-0.5 inline-flex size-4 align-text-bottom text-gray-400" />
      </HoverCardTrigger>
      <HoverCardContent className="px-3 py-2 text-sm text-gray-600">
        {children}
      </HoverCardContent>
    </HoverCard>
  )
}
