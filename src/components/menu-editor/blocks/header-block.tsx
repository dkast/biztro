"use client"

import * as React from "react"
import { useNode } from "@craftjs/core"
import { type RgbaColor } from "@uiw/react-color"
import { ChevronDown, Phone } from "lucide-react"
import Image from "next/image"

import GradientBlur from "@/components/flare-ui/gradient-blur"
import { FacebookIcon } from "@/components/icons/facebook-icon"
import { InstagramIcon } from "@/components/icons/instagram-icon"
import { TiktokIcon } from "@/components/icons/tiktok-icon"
import { TwitterIcon } from "@/components/icons/twitter-icon"
import { WhatsappIcon } from "@/components/icons/whatsapp-icon"
import HeaderSettings from "@/components/menu-editor/blocks/header-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  cn,
  getFormattedTime,
  getInitials,
  getOpenHoursLegend,
  getOpenHoursStatus
} from "@/lib/utils"

export type HeaderBlockProps = {
  layout: "classic" | "modern"
  organization: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>
  location?: Awaited<ReturnType<typeof getDefaultLocation>>
  fontFamily?: string
  accentColor?: RgbaColor
  backgroundColor?: RgbaColor
  showBanner?: boolean
  showLogo?: boolean
  showAddress?: boolean
  showSocialMedia?: boolean
}

export default function HeaderBlock({
  organization,
  location,
  layout,
  fontFamily,
  accentColor,
  backgroundColor,
  showBanner,
  showLogo,
  showAddress,
  showSocialMedia
}: HeaderBlockProps) {
  const {
    connectors: { connect }
  } = useNode()

  const renderClassic = () => {
    return (
      <>
        <Banner
          banner={organization.banner}
          isBannerVisible={showBanner ?? false}
          className="relative"
        />
        <div className="px-4 pt-4 pb-6">
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
              orgName={organization.name}
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
              "flex flex-row gap-1",
              showLogo ? "ml-20" : "pt-5",
              organization.banner && showBanner ? "" : "-mt-5"
            )}
            style={{
              color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
            }}
          >
            <LocationData
              isBusinessInfoVisible={showAddress ?? false}
              isOpenHoursVisible={showAddress ?? false}
              location={location}
              className="items-start"
            />
          </div>
        </div>
        <div
          style={{
            color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
          }}
        >
          <SocialMedia location={location} isVisible={showSocialMedia} />
        </div>
      </>
    )
  }

  const renderModern = () => {
    return (
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <div className="absolute inset-0 origin-top">
          <Banner
            banner={organization.banner}
            isBannerVisible={showBanner ?? false}
          />
          {showBanner && organization.banner && (
            <>
              <GradientBlur className="inset-x-0 bottom-0 h-2/3" />
              <div
                className="absolute inset-x-0 bottom-0 z-20 h-2/3"
                style={{
                  background: `linear-gradient(180deg, rgba(0,0,0,0), rgba(${Object.values(backgroundColor ?? { r: 0, g: 0, b: 0, a: 1 })}))`
                }}
              ></div>
            </>
          )}
        </div>
        <div className="z-20 flex flex-col items-center gap-2">
          <Logo
            logo={organization.logo}
            orgName={organization.name}
            isLogoVisible={showLogo ?? false}
            className="size-24 rounded-full shadow-lg"
          />
          <FontWrapper fontFamily={fontFamily}>
            <h1
              className={cn("text-xl font-semibold")}
              style={{
                color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
              }}
            >
              {organization?.name}
            </h1>
          </FontWrapper>
          <div
            style={{
              color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
            }}
          >
            <LocationData
              isBusinessInfoVisible={showAddress ?? false}
              isOpenHoursVisible={showAddress ?? false}
              location={location}
              className="items-center"
            />
          </div>
        </div>
        <div
          style={{
            color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
          }}
          className="z-20 mt-2"
        >
          <SocialMedia location={location} isVisible={showSocialMedia} />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
      className="relative"
    >
      {layout === "classic" ? renderClassic() : renderModern()}
    </div>
  )
}

function Banner({
  banner,
  className,
  isBannerVisible
}: {
  banner: string | null | undefined
  className?: string
  isBannerVisible: boolean
}) {
  return (
    banner &&
    isBannerVisible && (
      <div className={cn("h-32", className)}>
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
  orgName,
  isLogoVisible,
  className
}: {
  logo: string | null | undefined
  orgName: string
  isLogoVisible: boolean
  className?: string
}) {
  return (
    isLogoVisible && (
      <Avatar className={cn("size-16 rounded-xl shadow-sm", className)}>
        <AvatarImage src={logo ?? undefined} className="rounded-xl" />
        <AvatarFallback className="text-xl">
          {getInitials(orgName)}
        </AvatarFallback>
      </Avatar>
    )
  )
}

function LocationData({
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
      onClick={isMobile ? () => setIsDrawerOpen(true) : undefined}
      className="flex flex-row items-center gap-1 rounded-full border-[0.5px] border-white/10 px-1 py-0.5 backdrop-blur-md"
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
    <div className="flex flex-col divide-y dark:divide-gray-800">
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

  return (
    <div className={cn("flex flex-col gap-1 text-xs", className)}>
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
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <Popover>
              <PopoverTrigger asChild>{hoursTrigger}</PopoverTrigger>
              <PopoverContent className="min-w-72">{hoursList}</PopoverContent>
            </Popover>
          )}
        </>
      )}
    </div>
  )
}

function SocialMedia({
  location,
  isVisible
}: {
  location: Awaited<ReturnType<typeof getDefaultLocation>> | undefined
  isVisible: boolean | undefined
}) {
  if (!isVisible || !location) return null

  return (
    <div className="flex flex-row items-center justify-center gap-4 p-2">
      {location?.facebook && (
        <a
          href={`https://facebook.com/${location.facebook}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookIcon className="size-8" />
        </a>
      )}
      {location?.instagram && (
        <a
          href={`https://instagram.com/${location.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon className="size-8" />
        </a>
      )}
      {location?.twitter && (
        <a
          href={`https://twitter.com/${location.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TwitterIcon className="size-8" />
        </a>
      )}
      {location?.tiktok && (
        <a
          href={`https://tiktok.com/${location.tiktok}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TiktokIcon className="size-8" />
        </a>
      )}
      {location?.whatsapp && (
        <a
          href={`https://wa.me/${location.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsappIcon className="size-8" />
        </a>
      )}
    </div>
  )
}

HeaderBlock.craft = {
  displayName: "Cabecera",
  props: {
    layout: "modern",
    fontFamily: "Inter",
    color: { r: 38, g: 50, b: 56, a: 1 },
    accentColor: { r: 38, g: 50, b: 56, a: 1 },
    backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
    showBanner: true,
    showLogo: true,
    showAddress: true,
    showSocialMedia: true
  },
  custom: {
    iconKey: "header"
  },
  related: {
    settings: HeaderSettings
  },
  rules: {
    canDrag: () => false
  }
}
