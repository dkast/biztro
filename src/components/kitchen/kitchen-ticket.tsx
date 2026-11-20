"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { AlertTriangle, Clock, StickyNote } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import {
  formatElapsed,
  formatOrderNumber,
  getElapsedMinutes,
  getElapsedTone
} from "@/lib/orders"
import {
  kitchenStatusLabels,
  type KitchenStatus,
  type OrderTicket
} from "@/lib/types/order"
import { salesOrderTypeLabels } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

// Same hues as the action buttons (warning/success), which take the color of the status they move the ticket to.
const kitchenStatusStyles = {
  NEW: {
    header: "bg-blue-600 text-white",
    border: "border-blue-600"
  },
  PREPARING: {
    header: "bg-amber-400 text-amber-950",
    border: "border-amber-400"
  },
  READY: {
    header: "bg-emerald-400 text-emerald-950",
    border: "border-emerald-400"
  }
} as const satisfies Record<KitchenStatus, { header: string; border: string }>

export type TicketAction = {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: "default" | "outline" | "warning" | "success"
}

export function KitchenTicket({
  ticket,
  now,
  action,
  elapsedFrom = ticket.submittedAt,
  fill = true,
  footer
}: {
  ticket: OrderTicket
  now: number
  action?: TicketAction
  elapsedFrom?: string
  fill?: boolean
  footer?: ReactNode
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body) return

    const measure = () =>
      setIsOverflowing(body.scrollHeight > body.clientHeight + 1)

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(body)
    return () => observer.disconnect()
  }, [ticket.items, ticket.notes, fill])

  const minutes = getElapsedMinutes(elapsedFrom, now)
  const tone = getElapsedTone(minutes)
  const title = `Orden ${formatOrderNumber(ticket.number)}`

  return (
    <article
      aria-label={ticket.label ? `${title}, ${ticket.label}` : title}
      className={cn(
        `bg-card text-card-foreground flex w-full min-w-0 flex-col
        overflow-hidden rounded-xl border shadow-xs`,
        fill && "h-full min-h-0",
        kitchenStatusStyles[ticket.kitchenStatus].border
      )}
    >
      <TicketHeader ticket={ticket} minutes={minutes} tone={tone} />

      <div className={cn("relative", fill && "flex min-h-0 flex-1 flex-col")}>
        <div
          ref={bodyRef}
          className={cn("px-4 py-3", fill && "min-h-0 flex-1 overflow-hidden")}
        >
          <TicketItems ticket={ticket} />
        </div>
        {isOverflowing && (
          <div
            aria-hidden
            className="from-card pointer-events-none absolute inset-x-0 bottom-0
              h-8 bg-linear-to-t to-transparent"
          />
        )}
      </div>

      {isOverflowing && (
        <Button
          type="button"
          variant="ghost"
          className="h-11 shrink-0 rounded-none border-t text-sm"
          onClick={() => setIsSheetOpen(true)}
        >
          Ver ticket completo
        </Button>
      )}

      {(action || footer) && (
        <div className="shrink-0 border-t px-4 py-3">
          {footer}
          {action && <TicketActionButton action={action} />}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b p-5 text-left">
            <SheetTitle className="text-2xl tabular-nums">
              {formatOrderNumber(ticket.number)}
              {ticket.label && (
                <span className="text-muted-foreground font-medium">
                  {" "}
                  · {ticket.label}
                </span>
              )}
            </SheetTitle>
            <SheetDescription>
              {kitchenStatusLabels[ticket.kitchenStatus]} ·{" "}
              {salesOrderTypeLabels[ticket.orderType]} ·{" "}
              {formatElapsed(minutes)}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <TicketItems ticket={ticket} />
          </div>
          {action && (
            <SheetFooter className="border-t px-5 py-4">
              <TicketActionButton
                action={{
                  ...action,
                  onClick: () => {
                    setIsSheetOpen(false)
                    action.onClick()
                  }
                }}
              />
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </article>
  )
}

function TicketHeader({
  ticket,
  minutes,
  tone
}: {
  ticket: OrderTicket
  minutes: number
  tone: ReturnType<typeof getElapsedTone>
}) {
  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-2 px-4 py-3",
        kitchenStatusStyles[ticket.kitchenStatus].header
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-baseline gap-2">
          <span className="text-3xl leading-none font-bold tabular-nums">
            {formatOrderNumber(ticket.number)}
          </span>
          {ticket.label && (
            <span className="truncate text-base font-medium">
              {ticket.label}
            </span>
          )}
        </p>
        <p
          className={cn(
            `flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm
            font-semibold tabular-nums`,
            tone === "warning" && "bg-white text-amber-800",
            tone === "critical" && "bg-rose-600 text-white"
          )}
        >
          {tone === "critical" ? (
            <AlertTriangle aria-hidden className="size-4" />
          ) : (
            <Clock aria-hidden className="size-4" />
          )}
          <span>
            <span className="sr-only">Tiempo de espera: </span>
            {formatElapsed(minutes)}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold tracking-wide uppercase">
          {kitchenStatusLabels[ticket.kitchenStatus]}
        </span>
        <Badge
          variant="outline"
          className="bg-white text-gray-950 dark:text-gray-950"
        >
          {salesOrderTypeLabels[ticket.orderType]}
        </Badge>
      </div>
    </header>
  )
}

function TicketItems({ ticket }: { ticket: OrderTicket }) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {ticket.items.map(item => (
          <li key={item.id} className="flex gap-3">
            <span
              className="min-w-8 shrink-0 text-lg leading-snug font-semibold
                tabular-nums"
            >
              {item.quantity}×
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-lg leading-snug font-medium">
                {item.productName}
              </span>
              {item.variantName && (
                <span className="text-muted-foreground text-sm">
                  {item.variantName}
                </span>
              )}
              {item.notes?.trim() && (
                <TicketNote className="mt-1.5" srLabel="Nota del platillo: ">
                  {item.notes}
                </TicketNote>
              )}
            </div>
          </li>
        ))}
      </ul>
      {ticket.notes?.trim() && (
        <TicketNote title="Para toda la orden">{ticket.notes}</TicketNote>
      )}
    </div>
  )
}

function TicketNote({
  title,
  srLabel,
  className,
  children
}: {
  title?: string
  srLabel?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        `flex gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5
        text-sm font-medium text-amber-950 dark:border-amber-500/40
        dark:bg-amber-500/10 dark:text-amber-100`,
        className
      )}
    >
      <StickyNote aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p className="min-w-0 break-words whitespace-pre-line">
        {title && <span className="block font-semibold">{title}</span>}
        {srLabel && <span className="sr-only">{srLabel}</span>}
        {children}
      </p>
    </div>
  )
}

function TicketActionButton({ action }: { action: TicketAction }) {
  return (
    <Button
      type="button"
      variant={action.variant ?? "default"}
      className="h-14 w-full text-base font-semibold"
      disabled={action.disabled}
      onClick={action.onClick}
    >
      {action.icon}
      {action.label}
    </Button>
  )
}
