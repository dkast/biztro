"use client"

import * as React from "react"
import { useNode } from "@craftjs/core"
import { type RgbaColor } from "@uiw/react-color"
import { motion, useScroll, useSpring, useTransform } from "motion/react"
import Image from "next/image"

import GradientBlur from "@/components/flare-ui/gradient-blur"
import { FacebookIcon } from "@/components/icons/facebook-icon"
import { InstagramIcon } from "@/components/icons/instagram-icon"
import { TiktokIcon } from "@/components/icons/tiktok-icon"
import { TwitterIcon } from "@/components/icons/twitter-icon"
import { WhatsappIcon } from "@/components/icons/whatsapp-icon"
import HeaderSettings from "@/components/menu-editor/blocks/header-settings"
import LocationData from "@/components/menu-editor/blocks/location-data"
import { PublicMenuActions } from "@/components/menu-editor/blocks/public-menu-actions"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import { cn, getInitials } from "@/lib/utils"

export type HeaderBlockProps = {
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
  const headerRef = React.useRef<HTMLElement | null>(null)
  const scrollContainerRef = React.useRef<HTMLElement | null>(null)
  const [hasContainerScrollRoot, setHasContainerScrollRoot] =
    React.useState(false)

  const { scrollY: viewportScrollY } = useScroll()
  const { scrollY: containerScrollY } = useScroll(
    hasContainerScrollRoot ? { container: scrollContainerRef } : {}
  )

  const rawScrollY = useTransform(() =>
    hasContainerScrollRoot ? containerScrollY.get() : viewportScrollY.get()
  )

  const activeScrollY = useSpring(rawScrollY, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.5
  })

  React.useEffect(() => {
    const headerNode = headerRef.current
    if (!headerNode) return

    const scrollRoot = getScrollRoot(headerNode)
    scrollContainerRef.current = isElementScrollRoot(scrollRoot)
      ? scrollRoot
      : null
    setHasContainerScrollRoot(scrollContainerRef.current !== null)
  }, [])

  React.useEffect(() => {
    const headerNode = headerRef.current
    if (!headerNode) return

    const ownerWindow = headerNode.ownerDocument.defaultView ?? window

    const publishHeaderOffset = () => {
      headerNode.ownerDocument.documentElement.style.setProperty(
        "--menu-header-offset",
        `${headerNode.offsetHeight}px`
      )
    }

    publishHeaderOffset()

    const ResizeObserverClass = ownerWindow.ResizeObserver ?? ResizeObserver
    const resizeObserver = new ResizeObserverClass(publishHeaderOffset)
    resizeObserver.observe(headerNode)

    return () => {
      resizeObserver.disconnect()
      headerNode.ownerDocument.documentElement.style.removeProperty(
        "--menu-header-offset"
      )
    }
  }, [])

  const textColor = rgbaToCss(accentColor, { r: 0, g: 0, b: 0, a: 1 })
  const background = rgbaToCss(backgroundColor, {
    r: 255,
    g: 255,
    b: 255,
    a: 1
  })
  const expandedHeight = showAddress || showSocialMedia ? 286 : 238
  const collapsedHeight = 76

  const headerHeight = useTransform(
    activeScrollY,
    [0, SCROLL_END],
    [expandedHeight, collapsedHeight]
  )

  // Staggered crossfade: expanded fades out in the first half,
  // collapsed fades in during the second half. This avoids both
  // layers sitting at ~50% opacity simultaneously.
  const expandedOpacity = useTransform(activeScrollY, [0, SCROLL_MID], [1, 0])
  const expandedY = useTransform(activeScrollY, [0, SCROLL_MID], [0, -12])
  const expandedScale = useTransform(activeScrollY, [0, SCROLL_MID], [1, 0.95])

  const collapsedOpacity = useTransform(
    activeScrollY,
    [SCROLL_MID, SCROLL_END],
    [0, 1]
  )
  const collapsedY = useTransform(
    activeScrollY,
    [SCROLL_MID, SCROLL_END],
    [8, 0]
  )

  const expandedPointerEvents = useTransform(activeScrollY, value =>
    value < SCROLL_MID ? "auto" : "none"
  )
  const collapsedPointerEvents = useTransform(activeScrollY, value =>
    value >= SCROLL_MID ? "auto" : "none"
  )

  const bannerOverlayOpacity = useTransform(
    activeScrollY,
    [0, SCROLL_END],
    [0.5, 0.75]
  )

  return (
    <motion.header
      ref={ref => {
        headerRef.current = ref
        if (ref) {
          connect(ref)
        }
      }}
      className="sticky top-0 z-30 overflow-visible"
      style={{
        color: textColor,
        height: headerHeight
      }}
    >
      <div className="pointer-events-none absolute inset-0 origin-top">
        <BannerImage
          banner={organization.banner}
          isBannerVisible={showBanner ?? false}
          className="h-full"
        />
        {showBanner && organization.banner && (
          <>
            <GradientBlur className="inset-x-0 bottom-0 h-2/3" />
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, rgba(0, 0, 0, 0.08), ${background})`,
                opacity: bannerOverlayOpacity
              }}
            />
          </>
        )}
      </div>

      <div className="pointer-events-none absolute top-3 right-3 z-30">
        <div className="pointer-events-auto">
          <PublicMenuActions />
        </div>
      </div>

      <div className="relative z-20 h-full">
        {/* Expanded layout — fades out as user scrolls down */}
        <motion.div
          style={{
            opacity: expandedOpacity,
            y: expandedY,
            scale: expandedScale,
            pointerEvents: expandedPointerEvents
          }}
          className="absolute inset-0 flex flex-col items-center justify-center
            px-4 text-center"
        >
          <Logo
            logo={organization.logo}
            orgName={organization.name}
            isLogoVisible={showLogo ?? false}
            className="size-24 rounded-full shadow-lg"
          />
          <div className="mt-2">
            <FontWrapper fontFamily={fontFamily}>
              <h1
                className="text-xl leading-tight font-semibold text-balance
                  text-shadow-md"
              >
                {organization.name}
              </h1>
            </FontWrapper>
          </div>
          {showAddress && (
            <LocationData
              isBusinessInfoVisible={showAddress}
              isOpenHoursVisible={showAddress}
              location={location}
              className="mt-1 items-center"
            />
          )}
          {showSocialMedia && (
            <div className="mt-1">
              <SocialMedia location={location} isVisible={showSocialMedia} />
            </div>
          )}
        </motion.div>

        {/* Collapsed layout — fades in as user scrolls down */}
        <motion.div
          style={{
            opacity: collapsedOpacity,
            y: collapsedY,
            pointerEvents: collapsedPointerEvents,
            backgroundColor: showBanner
              ? undefined
              : rgbaToCss(backgroundColor, {
                  r: 255,
                  g: 255,
                  b: 255,
                  a: 1
                })
          }}
          className={cn(
            "absolute inset-0 flex h-full items-center px-4 py-2",
            showLogo ? "justify-start gap-3" : "justify-center",
            showBanner ? "" : "backdrop-blur-md"
          )}
        >
          <Logo
            logo={organization.logo}
            orgName={organization.name}
            isLogoVisible={showLogo ?? false}
            className="size-14 rounded-full shadow-lg"
          />
          <FontWrapper fontFamily={fontFamily}>
            <h2
              className="truncate text-lg leading-tight font-semibold
                text-shadow-md"
            >
              {organization.name}
            </h2>
          </FontWrapper>
        </motion.div>
      </div>
    </motion.header>
  )
}

const SCROLL_MID = 60
const SCROLL_END = 120

type ScrollRoot = Window | HTMLElement

function getScrollRoot(node: HTMLElement): ScrollRoot {
  let current: HTMLElement | null = node.parentElement
  const ownerWindow = node.ownerDocument.defaultView ?? window

  while (current) {
    if (current.dataset.menuScrollRoot === "true") {
      return current
    }

    const styles = ownerWindow.getComputedStyle(current)
    const overflowY = styles.overflowY

    if (
      /(auto|scroll|overlay)/.test(overflowY) &&
      current.scrollHeight > current.clientHeight
    ) {
      return current
    }

    current = current.parentElement
  }

  return ownerWindow
}

function _getScrollTop(root: ScrollRoot, ownerDocument: Document) {
  if (isElementScrollRoot(root)) {
    return root.scrollTop
  }

  return root.scrollY || ownerDocument.documentElement.scrollTop || 0
}

function isElementScrollRoot(root: ScrollRoot): root is HTMLElement {
  return "scrollTop" in root
}

function rgbaToCss(color: RgbaColor | undefined, fallback: RgbaColor) {
  const value = color ?? fallback
  return `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a ?? 1})`
}

function BannerImage({
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
      <div className={cn("relative", className)}>
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
