"use client"

import * as React from "react"
import { Info } from "lucide-react"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card"
import { useIsMobile } from "@/hooks/use-mobile"

export default function InfoHelper({
  children
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isMobile) setOpen(false)
  }, [isMobile])

  const trigger = (
    <button
      type="button"
      aria-label="Más información"
      onClick={e => {
        if (isMobile) {
          e.stopPropagation()
          setOpen(prev => !prev)
        }
      }}
      className="mx-1.5 my-0.5 inline-flex"
    >
      <Info className="size-4 align-text-bottom text-gray-400" />
    </button>
  )

  return (
    <HoverCard
      open={isMobile ? open : undefined}
      onOpenChange={isMobile ? setOpen : undefined}
    >
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent className="px-3 py-2 text-sm text-gray-600">
        {children}
      </HoverCardContent>
    </HoverCard>
  )
}
