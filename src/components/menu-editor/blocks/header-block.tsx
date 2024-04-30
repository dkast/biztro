import { useNode } from "@craftjs/core"
import type { Organization } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"
import Image from "next/image"

import HeaderSettings from "@/components/menu-editor/blocks/header-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"

export type HeaderBlockProps = {
  organization: Organization
  fontFamily?: string
  accentColor?: RgbaColor
  showBanner?: boolean
  showLogo?: boolean
}

export default function HeaderBlock({
  organization,
  fontFamily,
  accentColor,
  showBanner,
  showLogo
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
    >
      <div className="relative flex flex-col">
        {organization?.banner && showBanner ? (
          <div className="h-40">
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
      <div
        className={cn(
          "flex flex-row p-4",
          organization.banner && showBanner
            ? "-mt-12 items-end"
            : "my-2 items-center"
        )}
      >
        {showLogo ? (
          <Avatar className="h-16 w-16 rounded-xl">
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
              organization.banner && showBanner && "mt-12"
            )}
            style={{
              color: `rgb(${Object.values(accentColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
            }}
          >
            {organization?.name}
          </h1>
        </FontWrapper>
      </div>
    </div>
  )
}

HeaderBlock.craft = {
  displayName: "Encabezado",
  props: {
    accentColor: { r: 38, g: 50, b: 56, a: 1 },
    showBanner: true,
    showLogo: true
  },
  related: {
    settings: HeaderSettings
  },
  rules: {
    canDrag: () => false
  }
}
