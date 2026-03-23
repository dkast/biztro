"use client"

import * as React from "react"
import {
  ExternalLink,
  HandPlatter,
  InfoIcon,
  Motorbike,
  Phone,
  ShoppingBag
} from "lucide-react"

import { useTranslation } from "@/components/menu-editor/translation-provider"
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
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatPrice } from "@/lib/currency"
import { getUILabels } from "@/lib/ui-labels"
import {
  cn,
  getFormattedTime,
  getOpenHoursLegend,
  getOpenHoursStatus
} from "@/lib/utils"

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
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null)
  const translation = useTranslation()
  const locale = translation?.locale ?? null
  const t = translation?.t ?? getUILabels(locale)

  const DAY_LABELS = React.useMemo<Record<string, string>>(
    () => ({
      MONDAY: t("monday"),
      TUESDAY: t("tuesday"),
      WEDNESDAY: t("wednesday"),
      THURSDAY: t("thursday"),
      FRIDAY: t("friday"),
      SATURDAY: t("saturday"),
      SUNDAY: t("sunday")
    }),
    [t]
  )

  React.useEffect(() => {
    if (!isMobile) {
      setIsDrawerOpen(false)
    }
  }, [isMobile])

  React.useEffect(() => {
    const updateCurrentDate = () => {
      setCurrentDate(new Date())
    }

    updateCurrentDate()

    const intervalId = window.setInterval(updateCurrentDate, 60_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  if (!location) return null

  const isOpenNow =
    currentDate !== null
      ? getOpenHoursStatus(location.openingHours ?? [], currentDate) === "OPEN"
      : false
  const legend =
    currentDate !== null
      ? getOpenHoursLegend(location.openingHours ?? [], locale, currentDate)
      : location.openingHours?.length
        ? t("closed")
        : t("no_schedule")

  const hoursTrigger = (
    <button
      type="button"
      onClick={
        isMobile ? () => setIsDrawerOpen(true) : () => setIsDialogOpen(true)
      }
      className="flex flex-row items-center gap-1 rounded-full border-[0.5px]
        border-white/50 bg-white/20 px-1 py-0.5 backdrop-blur-md"
      aria-label="Ver horario"
    >
      <div className="dark">
        {isOpenNow ? (
          <div
            className="flex-none rounded-full bg-green-500/10 p-1 text-green-500
              dark:bg-green-400/10 dark:text-green-400"
          >
            <div className="size-2 rounded-full bg-current"></div>
          </div>
        ) : (
          <div
            className="flex-none rounded-full bg-rose-500/10 p-1 text-rose-500
              dark:bg-rose-400/10 dark:text-rose-400"
          >
            <div className="size-2 rounded-full bg-current"></div>
          </div>
        )}
      </div>
      <span>{legend}</span>
      <InfoIcon className="ml-1 inline-block size-3" />
    </button>
  )

  const hoursList = (
    <div className="flex flex-col divide-y">
      {(() => {
        const DAY_INDEX_TO_NAME = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY"
        ] as const
        const todayName =
          currentDate !== null ? DAY_INDEX_TO_NAME[currentDate.getDay()] : null

        return location.openingHours?.map(day => {
          const isToday = todayName !== null && day.day === todayName

          return (
            <div
              key={day.day}
              className={cn(
                "grid grid-cols-3 px-4 py-2 text-xs",
                isToday && "bg-indigo-50 dark:bg-indigo-900/20"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  isToday && "text-indigo-700 dark:text-indigo-300"
                )}
              >
                {DAY_LABELS[day.day] ?? day.day}
              </span>
              <span
                className={cn(
                  day.allDay
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-gray-400 dark:text-gray-600",
                  "col-span-2 tabular-nums",
                  isToday && "text-indigo-700 dark:text-indigo-300"
                )}
              >
                {day.allDay
                  ? `${getFormattedTime(day.startTime)} - ${getFormattedTime(day.endTime)}`
                  : t("closed")}
              </span>
            </div>
          )
        })
      })()}
    </div>
  )

  const servicesList = (
    <div className="text-sm">
      <div className="font-medium">{t("available_services")}</div>
      <ItemGroup className="mt-2 gap-1">
        {location.serviceDelivery && (
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <Motorbike />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {t("delivery")} —{" "}
                <span className="text-muted-foreground">
                  {location.deliveryFee === 0
                    ? t("free")
                    : formatPrice(
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
              <ItemTitle>{t("takeout")}</ItemTitle>
            </ItemContent>
          </Item>
        )}

        {location.serviceDineIn && (
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <HandPlatter />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{t("dine_in")}</ItemTitle>
            </ItemContent>
          </Item>
        )}
      </ItemGroup>
    </div>
  )

  const address = location.address ? (
    <Item size="sm" variant="muted" className="py-2">
      <ItemContent>
        <ItemTitle>{t("address")}</ItemTitle>
        <ItemDescription>{location.address}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          aria-label="Abrir dirección en Google Maps"
        >
          <ExternalLink className="size-5" />
        </a>
      </ItemActions>
    </Item>
  ) : null

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
            <div className="flex flex-row items-center gap-1.5">
              <Phone className="inline-block size-2.5" />
              <span>
                {/* Tel:&nbsp; */}
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
                <DrawerContent className="space-y-1 px-4 pb-8">
                  <DrawerHeader>
                    <DrawerTitle>{t("information")}</DrawerTitle>
                    <p className="text-muted-foreground text-xs">{legend}</p>
                  </DrawerHeader>
                  {address}
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
                  <DialogTitle>{t("information")}</DialogTitle>
                  <DialogDescription className="text-xs">
                    {legend}
                  </DialogDescription>
                </DialogHeader>
                {address}
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
