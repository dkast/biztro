import React from "react"
import Image from "next/image"
import { Site } from "@prisma/client"
import { useNode, UserComponent } from "@craftjs/core"

import BlurImage from "@/components/BlurImage"
import { PhoneIcon } from "@heroicons/react/solid"
import SiteEditor from "pages/app/site-editor"

interface MenuBannerProps {
  site: Site
}

const MenuBanner: UserComponent<MenuBannerProps> = ({ site }) => {
  const {
    connectors: { connect }
  } = useNode()
  return (
    <div ref={connect} className="flex flex-col">
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
      <div className="z-10 flex flex-row">
        <div className="ml-4 -mt-12 h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-white">
          <Image src={site.logo} alt="logo" width={100} height={100}></Image>
        </div>
        <div className="flex flex-col gap-1 px-4 py-2">
          <h1 className="text-lg">{site.name}</h1>
          <p className="text-sm text-gray-600">{site.description}</p>
          <span className="flex items-center text-sm">
            <PhoneIcon className="mr-2 inline h-4 w-4" />
            <span>
              Tel:
              <a href={`tel:+52-${site.phone}`} className="ml-1 underline">
                {site.phone}
              </a>
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

MenuBanner.craft = {
  displayName: "Banner"
}

export default MenuBanner
