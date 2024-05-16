import { useNode } from "@craftjs/core"
import type { Location, Organization } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"
import { Phone } from "lucide-react"
import Image from "next/image"

import HeaderSettings from "@/components/menu-editor/blocks/header-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"

export type HeaderBlockProps = {
  organization: Organization
  location?: Location
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
        {organization?.banner && showBanner ? (
          <div className="h-32">
            <Image
              alt="Banner"
              className="object-cover"
              src={organization.banner}
              fill
              unoptimized
            />
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <div
          className={cn(
            "flex flex-row",
            organization.banner && showBanner
              ? "-mt-12 items-end"
              : "my-2 items-center"
          )}
        >
          {showLogo ? (
            <Avatar className="h-16 w-16 rounded-xl shadow">
              {organization.logo && (
                <AvatarImage src={organization.logo} className="rounded-xl" />
              )}
              <AvatarFallback className="text-xl">
                {getInitials(organization.name)}
              </AvatarFallback>
            </Avatar>
          ) : null}
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
        {showAddress && (
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
            <span>{location?.address}</span>
            {location?.phone && (
              <div className="flex flex-row items-center gap-1">
                <Phone className="inline-block size-2.5" />
                <span>
                  Tel:&nbsp;
                  <a href={`tel:${location?.phone}`} className="underline">
                    {location?.phone}
                  </a>
                </span>
              </div>
            )}
          </div>
        )}
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

HeaderBlock.craft = {
  displayName: "Cabecera",
  props: {
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
