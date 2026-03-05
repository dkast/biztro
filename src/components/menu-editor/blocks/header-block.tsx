"use client"

import * as React from "react"
import { useNode } from "@craftjs/core"
import { type RgbaColor } from "@uiw/react-color"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform
} from "motion/react"
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
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const { scrollY: viewportScrollY } = useScroll()
  const { scrollY: containerScrollY } = useScroll(
    hasContainerScrollRoot ? { container: scrollContainerRef } : {}
  )

  const activeScrollY = useTransform(() =>
    hasContainerScrollRoot ? containerScrollY.get() : viewportScrollY.get()
  )

  useMotionValueEvent(activeScrollY, "change", latest => {
    setIsCollapsed(previousValue => {
      if (latest >= 72) return true
      if (latest <= 24) return false
      return previousValue
    })
  })

  React.useEffect(() => {
    const headerNode = headerRef.current
    if (!headerNode) return

    const scrollRoot = getScrollRoot(headerNode)
    scrollContainerRef.current = isElementScrollRoot(scrollRoot)
      ? scrollRoot
      : null
    setHasContainerScrollRoot(scrollContainerRef.current !== null)

    const initialScrollTop = getScrollTop(scrollRoot, headerNode.ownerDocument)
    setIsCollapsed(initialScrollTop >= 72)
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
    }
  }, [])

  const textColor = rgbaToCss(accentColor, { r: 0, g: 0, b: 0, a: 1 })
  const background = rgbaToCss(backgroundColor, {
    r: 255,
    g: 255,
    b: 255,
    a: 1
  })
  const expandedHeight = showAddress || showSocialMedia ? 250 : 214
  const collapsedHeight = 104

  return (
    <motion.header
      ref={ref => {
        headerRef.current = ref
        if (ref) {
          connect(ref)
        }
      }}
      className="sticky top-0 z-30 overflow-hidden"
      initial={false}
      animate={{ height: isCollapsed ? collapsedHeight : expandedHeight }}
      transition={HEADER_SPRING_TRANSITION}
      style={{
        color: textColor
      }}
    >
      <div className="absolute inset-0 origin-top">
        <Banner
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
                background: `linear-gradient(180deg, rgba(0, 0, 0, 0.08), ${background})`
              }}
              animate={{ opacity: isCollapsed ? 0.75 : 0.5 }}
              transition={HEADER_OPACITY_TRANSITION}
            />
          </>
        )}
      </div>

      <div className="relative z-20 h-full">
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed ? (
            <motion.div
              key="collapsed-layout"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={HEADER_OPACITY_TRANSITION}
              className={cn(
                "flex h-full items-center px-4 py-2",
                showLogo ? "justify-start gap-3" : "justify-center",
                showBanner ? "" : "backdrop-blur-md"
              )}
            >
              <Logo
                logo={organization.logo}
                orgName={organization.name}
                isLogoVisible={showLogo ?? false}
                className="mt-3 size-14 rounded-full shadow-lg"
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
          ) : (
            <motion.div
              key="expanded-layout"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={HEADER_OPACITY_TRANSITION}
              className="flex h-full flex-col items-center justify-center px-4
                py-4 text-center"
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
                  <SocialMedia
                    location={location}
                    isVisible={showSocialMedia}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

const HEADER_SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
}

const HEADER_OPACITY_TRANSITION = { duration: 0.2 }

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

function getScrollTop(root: ScrollRoot, ownerDocument: Document) {
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
