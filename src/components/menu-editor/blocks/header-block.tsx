"use client"

import * as React from "react"
import { useNode } from "@craftjs/core"
import { type RgbaColor } from "@uiw/react-color"
import Image from "next/image"

import GradientBlur from "@/components/flare-ui/gradient-blur"
import { FacebookIcon } from "@/components/icons/facebook-icon"
import { InstagramIcon } from "@/components/icons/instagram-icon"
import { TiktokIcon } from "@/components/icons/tiktok-icon"
import { TwitterIcon } from "@/components/icons/twitter-icon"
import { WhatsappIcon } from "@/components/icons/whatsapp-icon"
import HeaderSettings from "@/components/menu-editor/blocks/header-settings"
import LocationData from "@/components/menu-editor/blocks/location-data"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import { cn, getInitials } from "@/lib/utils"

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
    const hasBanner = Boolean(organization.banner && showBanner)

    return (
      <>
        <Banner
          banner={organization.banner}
          isBannerVisible={showBanner ?? false}
          className="relative h-28"
        />
        <div
          className={cn("px-4 pt-3 pb-4", hasBanner && "relative z-10 -mt-10")}
        >
          <div
            className="rounded-xl border border-black/10 shadow-sm"
            style={{
              color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
            }}
          >
            <div className="flex items-start gap-3 p-2.5">
              <Logo
                logo={organization.logo}
                orgName={organization.name}
                isLogoVisible={showLogo ?? false}
                className="size-14 rounded-lg shadow-none"
              />
              <div className="min-w-0 flex-1">
                <FontWrapper fontFamily={fontFamily}>
                  <h1
                    className="text-xl leading-tight font-semibold text-balance"
                  >
                    {organization?.name}
                  </h1>
                </FontWrapper>
                <LocationData
                  isBusinessInfoVisible={showAddress ?? false}
                  isOpenHoursVisible={showAddress ?? false}
                  location={location}
                  className="mt-1 items-start"
                />
              </div>
            </div>
            {showSocialMedia && (
              <div className="mt-1 border-t border-black/10 px-2.5 pt-2 pb-2">
                <SocialMedia
                  location={location}
                  isVisible={showSocialMedia}
                  className="justify-start gap-2.5 p-0"
                  iconClassName="size-6"
                />
              </div>
            )}
          </div>
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
              className={cn("text-xl font-semibold text-balance")}
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

function SocialMedia({
  location,
  isVisible,
  className,
  iconClassName
}: {
  location: Awaited<ReturnType<typeof getDefaultLocation>> | undefined
  isVisible: boolean | undefined
  className?: string
  iconClassName?: string
}) {
  if (!isVisible || !location) return null

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center gap-4 p-2",
        className
      )}
    >
      {location?.facebook && (
        <a
          href={`https://facebook.com/${location.facebook}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FacebookIcon className={cn("size-8", iconClassName)} />
        </a>
      )}
      {location?.instagram && (
        <a
          href={`https://instagram.com/${location.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <InstagramIcon className={cn("size-8", iconClassName)} />
        </a>
      )}
      {location?.twitter && (
        <a
          href={`https://twitter.com/${location.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
        >
          <TwitterIcon className={cn("size-8", iconClassName)} />
        </a>
      )}
      {location?.tiktok && (
        <a
          href={`https://tiktok.com/${location.tiktok}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <TiktokIcon className={cn("size-8", iconClassName)} />
        </a>
      )}
      {location?.whatsapp && (
        <a
          href={`https://wa.me/${location.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <WhatsappIcon className={cn("size-8", iconClassName)} />
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
