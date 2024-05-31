import { start } from "repl"
import { useNode } from "@craftjs/core"
import {
  CalendarDateTime,
  getLocalTimeZone,
  parseTime,
  startOfWeek,
  Time,
  toCalendarDateTime,
  today
} from "@internationalized/date"
import type { OpeningHours, Organization, Prisma } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"
import { Clock, Phone } from "lucide-react"
import Image from "next/image"

import HeaderSettings from "@/components/menu-editor/blocks/header-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { cn, getInitials } from "@/lib/utils"

export type HeaderBlockProps = {
  organization: Organization
  location?: Prisma.PromiseReturnType<typeof getDefaultLocation>
  fontFamily?: string
  color?: RgbaColor
  accentColor?: RgbaColor
  showBanner?: boolean
  showLogo?: boolean
  showAddress?: boolean
  showSocialMedia?: boolean
}

export default function HeaderBlock({
  organization,
  location,
  fontFamily,
  color,
  accentColor,
  showBanner,
  showLogo,
  showAddress,
  showSocialMedia
}: HeaderBlockProps) {
  const {
    connectors: { connect }
  } = useNode()
  return (
    <div
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
      className="relative"
    >
      <div className="relative flex flex-col">
        <Banner
          banner={organization.banner}
          isBannerVisible={showBanner ?? false}
        />
      </div>
      <div className="p-4">
        {/* Logo and organization name */}
        <div
          className={cn(
            "flex flex-row",
            organization.banner && showBanner
              ? "-mt-12 items-end"
              : "my-2 items-center"
          )}
        >
          <Logo
            logo={organization.logo}
            name={organization.name}
            isLogoVisible={showLogo ?? false}
          />
          <FontWrapper fontFamily={fontFamily}>
            <h1
              className={cn(
                "z-10 text-xl font-semibold",
                showLogo && "ml-4",
                organization.banner && showBanner && "mt-10"
              )}
              style={{
                color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
              }}
            >
              {organization?.name}
            </h1>
          </FontWrapper>
        </div>
        {/* Location data */}
        <div
          className={cn(
            "flex flex-col gap-1 text-xs opacity-75",
            showLogo ? "ml-20" : "pt-3",
            organization.banner && showBanner ? "" : "-mt-5"
          )}
          style={{
            color: `rgb(${Object.values(color ?? { r: 0, g: 0, b: 0, a: 1 })})`
          }}
        >
          {location && (
            <LocationData
              isAddressVisible={showAddress ?? false}
              isOpenHoursVisible={showAddress ?? false}
              location={location}
            />
          )}
        </div>
      </div>
      {/* Show location social media */}
      {showSocialMedia && (
        <div className="absolute right-0 top-0 rounded-bl opacity-75 has-[a]:bg-white">
          <div className="flex flex-row items-center gap-3 p-2">
            {location?.facebook && (
              <a
                href={`https://facebook.com/${location.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  alt="Facebook"
                  height={24}
                  width={24}
                  src="/facebook-mono.svg"
                />
              </a>
            )}
            {location?.instagram && (
              <a
                href={`https://instagram.com/${location.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  alt="Instagram"
                  height={24}
                  width={24}
                  src="/instagram-mono.svg"
                />
              </a>
            )}
            {location?.twitter && (
              <a
                href={`https://twitter.com/${location.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  alt="Twitter"
                  height={24}
                  width={24}
                  src="/twitter-mono.svg"
                />
              </a>
            )}
            {location?.tiktok && (
              <a
                href={`https://tiktok.com/${location.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  alt="Youtube"
                  height={24}
                  width={24}
                  src="/tiktok-mono.svg"
                />
              </a>
            )}
            {location?.whatsapp && (
              <a
                href={`https://wa.me/${location.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  alt="Youtube"
                  height={24}
                  width={24}
                  src="/whatsapp-mono.svg"
                />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Banner({
  banner,
  isBannerVisible
}: {
  banner: string | null | undefined
  isBannerVisible: boolean
}) {
  return (
    banner &&
    isBannerVisible && (
      <div className="h-32">
        <Image
          alt="Banner"
          className="object-cover"
          src={banner}
          fill
          unoptimized
        />
      </div>
    )
  )
}

function Logo({
  logo,
  name,
  isLogoVisible
}: {
  logo: string | null | undefined
  name: string
  isLogoVisible: boolean
}) {
  return (
    isLogoVisible && (
      <Avatar className="h-16 w-16 rounded-xl shadow">
        <AvatarImage src={logo ?? undefined} className="rounded-xl" />
        <AvatarFallback className="text-xl">{getInitials(name)}</AvatarFallback>
      </Avatar>
    )
  )
}

function LocationData({
  isAddressVisible,
  isOpenHoursVisible,
  location
}: {
  isAddressVisible: boolean
  isOpenHoursVisible: boolean
  location: NonNullable<Prisma.PromiseReturnType<typeof getDefaultLocation>>
}) {
  return (
    <div className="flex flex-col gap-1">
      <span>{location.address}</span>
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
      {isOpenHoursVisible && location.openingHours && (
        <div className="flex flex-row items-center gap-1">
          <Clock className="inline-block size-2.5" />
          <span>{getOpenHoursStatus(location.openingHours)}</span>
        </div>
      )}
    </div>
  )
}

function getOpenHoursStatus(openingHours: OpeningHours[]) {
  let status = "Cerrado"

  const currentDate = today(getLocalTimeZone())
  const now = new Date()
  const currentTime = toCalendarDateTime(
    currentDate,
    new Time(now.getHours(), now.getMinutes())
  )
  const startWeek = startOfWeek(currentDate, "es-MX")

  for (const day of openingHours) {
    // convert day to date based on the week start
    let weekDayNbr = 0
    switch (day.day) {
      case "MONDAY":
        weekDayNbr = 1
        break
      case "TUESDAY":
        weekDayNbr = 2
        break
      case "WEDNESDAY":
        weekDayNbr = 3
        break
      case "THURSDAY":
        weekDayNbr = 4
        break
      case "FRIDAY":
        weekDayNbr = 5
        break
      case "SATURDAY":
        weekDayNbr = 6
        break
      case "SUNDAY":
        weekDayNbr = 7
        break
    }

    if (!day.allDay) {
      continue
    }

    const dayDate = startWeek.add({ days: weekDayNbr })
    // console.log(startWeek, weekDayNbr, dayDate)
    const startTime = parseTime(day.startTime ?? "")
    const endTime = parseTime(day.endTime ?? "")

    const openDateTime = toCalendarDateTime(dayDate, startTime)

    let closeDateTime
    if (endTime.hour < startTime.hour) {
      closeDateTime = toCalendarDateTime(dayDate.add({ days: 1 }), endTime)
    } else {
      closeDateTime = toCalendarDateTime(dayDate, endTime)
    }

    const formatClosed = closeDateTime
      .toDate(getLocalTimeZone())
      .toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
      })

    // console.log(currentTime, openDateTime, closeDateTime)
    if (
      currentTime.compare(openDateTime) >= 0 &&
      currentTime.compare(closeDateTime) <= 0
    ) {
      status = `Abierto - Hasta ${endTime.hour === 1 ? "la" : "las"} ${formatClosed}`
      break
    }
  }

  return status
}

HeaderBlock.craft = {
  displayName: "Cabecera",
  props: {
    fontFamily: "Inter",
    color: { r: 38, g: 50, b: 56, a: 1 },
    accentColor: { r: 38, g: 50, b: 56, a: 1 },
    showBanner: true,
    showLogo: true,
    showAddress: true,
    showSocialMedia: true
  },
  related: {
    settings: HeaderSettings
  },
  rules: {
    canDrag: () => false
  }
}
