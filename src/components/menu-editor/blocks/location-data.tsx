"use client"

import * as React from "react"
import {
  ChevronDown,
  HandPlatter,
  Motorbike,
  Phone,
  ShoppingBag
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  cn,
  getFormattedTime,
  getOpenHoursLegend,
  getOpenHoursStatus
} from "@/lib/utils"

function formatCurrency(amount: number, currency: "MXN" | "USD" | undefined) {
  const locale = currency === "USD" ? "en-US" : "es-MX"
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency ?? "MXN"
    }).format(amount)
  } catch {
    return `${amount} ${currency ?? "MXN"}`
  }
}

export default function LocationData({
  isBusinessInfoVisible,
  isOpenHoursVisible,
  location,
  className
}: {
  isBusinessInfoVisible: boolean
  isOpenHoursVisible: boolean
  location: Awaited<ReturnType<typeof getDefaultLocation>> | undefined
  className?: string
}) {
  const isMobile = useIsMobile()
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isMobile) {
      setIsDrawerOpen(false)
    }
  }, [isMobile])

  if (!location) return null

  const isOpenNow = getOpenHoursStatus(location.openingHours ?? []) === "OPEN"
  const legend = getOpenHoursLegend(location.openingHours ?? [])

  const hoursTrigger = (
    <button
      type="button"
      onClick={
        isMobile ? () => setIsDrawerOpen(true) : () => setIsDialogOpen(true)
      }
      className="flex flex-row items-center gap-1 rounded-full border-[0.5px] border-white/50 bg-white/20 px-1 py-0.5 backdrop-blur-md"
      aria-label="Ver horario"
    >
      <div className="dark">
        {isOpenNow ? (
          <div className="flex-none rounded-full bg-green-500/10 p-1 text-green-500 dark:bg-green-400/10 dark:text-green-400">
            <div className="size-2 rounded-full bg-current"></div>
          </div>
        ) : (
          <div className="flex-none rounded-full bg-rose-500/10 p-1 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400">
            <div className="size-2 rounded-full bg-current"></div>
          </div>
        )}
      </div>
      <span>{legend}</span>
      <ChevronDown className="inline-block size-2.5" />
    </button>
  )

  const hoursList = (
    <div className="flex flex-col divide-y px-4 dark:divide-gray-800">
      {location.openingHours?.map(day => (
        <div key={day.day} className="grid grid-cols-3 py-2 text-xs">
          <span className="font-medium">
            {day.day === "MONDAY" && "Lunes"}
            {day.day === "TUESDAY" && "Martes"}
            {day.day === "WEDNESDAY" && "Miércoles"}
            {day.day === "THURSDAY" && "Jueves"}
            {day.day === "FRIDAY" && "Viernes"}
            {day.day === "SATURDAY" && "Sábado"}
            {day.day === "SUNDAY" && "Domingo"}
          </span>
          <span
            className={cn(
              day.allDay
                ? "text-gray-600 dark:text-gray-400"
                : "text-gray-400 dark:text-gray-600",
              "col-span-2 tabular-nums"
            )}
          >
            {day.allDay
              ? `${getFormattedTime(day.startTime)} - ${getFormattedTime(day.endTime)}`
              : "Cerrado"}
          </span>
        </div>
      ))}
    </div>
  )

  const servicesList = (
    <div className="mt-3 text-sm">
      <div className="font-medium">Servicios</div>
      <ItemGroup className="mt-2 gap-1">
        {location.serviceDelivery && (
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <Motorbike />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                Entrega a domicilio —{" "}
                <span className="text-muted-foreground">
                  {location.deliveryFee === 0
                    ? "Gratis"
                    : formatCurrency(
                        location.deliveryFee,
                        location.currency as "MXN" | "USD"
                      )}
                </span>
              </ItemTitle>
            </ItemContent>
          </Item>
        )}

        {location.serviceTakeout && (
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <ShoppingBag />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Para llevar</ItemTitle>
            </ItemContent>
          </Item>
        )}

        {location.serviceDineIn && (
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <HandPlatter />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Comer en el lugar</ItemTitle>
            </ItemContent>
          </Item>
        )}
      </ItemGroup>
    </div>
  )

  return (
    <div className={cn("flex flex-col gap-2 text-xs", className)}>
      {isBusinessInfoVisible && (
        <>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {location.address}
          </a>
          {location.phone && (
            <div className="flex flex-row items-center gap-1">
              <Phone className="inline-block size-2.5" />
              <span>
                Tel:&nbsp;
                <a href={`tel:${location.phone}`} className="underline">
                  {location.phone}
                </a>
              </span>
            </div>
          )}
        </>
      )}
      {isOpenHoursVisible && location.openingHours && (
        <>
          {isMobile ? (
            <>
              {hoursTrigger}
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="px-4 pb-8">
                  <DrawerHeader>
                    <DrawerTitle>Horarios</DrawerTitle>
                    <p className="text-muted-foreground text-xs">{legend}</p>
                  </DrawerHeader>
                  {hoursList}
                  {servicesList}
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>{hoursTrigger}</DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Información</DialogTitle>
                  <DialogDescription className="text-xs">
                    {legend}
                  </DialogDescription>
                </DialogHeader>
                {hoursList}
                {servicesList}
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  )
}
