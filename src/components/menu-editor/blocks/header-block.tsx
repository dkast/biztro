import { useNode } from "@craftjs/core"
import type { Organization, Prisma } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"
import { ChevronDown, Clock, Phone } from "lucide-react"
import Image from "next/image"

import GradientBlur from "@/components/flare-ui/gradient-blur"
import HeaderSettings from "@/components/menu-editor/blocks/header-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import {
  cn,
  getFormattedTime,
  getInitials,
  getOpenHoursStatus
} from "@/lib/utils"

export type HeaderBlockProps = {
  layout: "classic" | "modern"
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
  layout,
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

  const renderClassic = () => {
    return (
      <>
        <Banner
          banner={organization.banner}
          isBannerVisible={showBanner ?? false}
          className="relative"
        />
        <div className="px-4 pb-8 pt-4">
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
              "flex flex-col",
              showLogo ? "ml-20" : "pt-5",
              organization.banner && showBanner ? "" : "-mt-5"
            )}
            style={{
              color: `rgb(${Object.values(color ?? { r: 0, g: 0, b: 0, a: 1 })})`
            }}
          >
            <LocationData
              isBusinessInfoVisible={showAddress ?? false}
              isOpenHoursVisible={showAddress ?? false}
              location={location}
            />
          </div>
        </div>
        <SocialMedia location={location} isVisible={showSocialMedia} />
      </>
    )
  }

  const renderModern = () => {
    return (
      <>
        <div className="flex items-center justify-center pb-6 pt-8">
          <div className="absolute inset-0 origin-top">
            <Banner
              banner={organization.banner}
              isBannerVisible={showBanner ?? false}
            />
            {showBanner && (
              <GradientBlur className="inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent to-black/30" />
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
        </div>
        <SocialMedia location={location} isVisible={showSocialMedia} />
      </>
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
      <Avatar className={cn("size-16 rounded-xl shadow", className)}>
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
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | undefined
  className?: string
}) {
  if (!location) return null

  return (
    <div className={cn("flex flex-col gap-1 text-xs", className)}>
      {isBusinessInfoVisible && (
        <>
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
        </>
      )}
      {isOpenHoursVisible && location.openingHours && (
        <Popover>
          <PopoverTrigger>
            <div className="flex flex-row items-center gap-1">
              <Clock className="inline-block size-2.5" />
              <span>{getOpenHoursStatus(location.openingHours)}</span>
              <ChevronDown className="inline-block size-2.5" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="min-w-72">
            <div className="flex flex-col divide-y divide-gray-800">
              {location.openingHours.map(day => {
                return (
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
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

function SocialMedia({
  location,
  isVisible
}: {
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | undefined
  isVisible: boolean | undefined
}) {
  if (!isVisible || !location) return null

  return (
    <div className="absolute right-0 top-0 rounded-bl-lg backdrop-blur-sm has-[a]:bg-white/75">
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
  )
}

HeaderBlock.craft = {
  displayName: "Cabecera",
  props: {
    layout: "classic",
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
