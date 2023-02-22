import { useNode, UserComponent } from "@craftjs/core"
import { PhoneIcon } from "@heroicons/react/solid"
import { Site } from "@prisma/client"
import Image from "next/image"
import React from "react"

import BlurImage from "@/components/BlurImage"
import MenuBannerSettings from "@/components/selectors/MenuBanner/MenuBannerSettings"

import classNames from "@/lib/classnames"

interface MenuBannerProps {
  site: Site
  titleColor?: Record<"r" | "g" | "b" | "a", number>
  textColor?: Record<"r" | "g" | "b" | "a", number>
  showBanner: boolean
  showLogo: boolean
}

const MenuBanner: UserComponent<MenuBannerProps> = ({
  site,
  titleColor,
  textColor,
  showBanner,
  showLogo
}) => {
  const {
    connectors: { connect }
  } = useNode()
  return (
    <div ref={connect} className="flex flex-col">
      {site?.image && showBanner ? (
        <BlurImage
          alt="Banner"
          blurDataURL={site.imageBlurhash ?? undefined}
          height={400}
          layout="intrinsic"
          objectFit="cover"
          placeholder="blur"
          src={site.image}
          width={1200}
        />
      ) : null}
      <div className="z-10 flex flex-row">
        {site?.logo && showLogo ? (
          <div
            className={classNames(
              site?.image && showBanner ? "-mt-12" : "my-2",
              "ml-4 h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-white"
            )}
          >
            <Image src={site.logo} alt="logo" width={100} height={100}></Image>
          </div>
        ) : null}
        <div
          className={classNames(
            !site?.logo || !showLogo
              ? "flex flex-1 flex-col items-center"
              : null,
            "flex flex-col gap-1 px-4 py-2"
          )}
        >
          <h1
            className="text-lg font-bold"
            style={{
              color: `rgba(${Object.values(titleColor)})`
            }}
          >
            {site.name}
          </h1>
          <p
            className="text-sm line-clamp-1"
            style={{
              color: `rgba(${Object.values(textColor)})`
            }}
          >
            {site.description}
          </p>
          {site?.phone && (
            <span
              className="flex items-center text-sm"
              style={{
                color: `rgba(${Object.values(textColor)})`
              }}
            >
              <PhoneIcon className="mr-2 inline h-4 w-4" />
              <span>
                Tel:
                <a href={`tel:+52-${site.phone}`} className="ml-1 underline">
                  {site.phone}
                </a>
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

MenuBanner.craft = {
  displayName: "Banner",
  props: {
    titleColor: { r: 38, g: 50, b: 56, a: 1 },
    textColor: { r: 82, g: 82, b: 82, a: 1 },
    showBanner: true,
    showLogo: true
  },
  related: {
    toolbar: MenuBannerSettings
  },
  rules: {
    canDrag: () => false
  }
}

export default MenuBanner
