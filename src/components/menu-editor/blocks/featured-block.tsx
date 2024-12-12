"use client"

import { useEditor, useNode } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"

import FeaturedSettings from "@/components/menu-editor/blocks/featured-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import type { getFeaturedItems } from "@/server/actions/item/queries"
import { cn } from "@/lib/utils"

export type FeaturedBlockProps = {
  items: Prisma.PromiseReturnType<typeof getFeaturedItems>
  backgroundColor?: RgbaColor
  backgroundMode: "dark" | "light" | "none"
  itemFontSize?: number
  itemColor?: RgbaColor
  itemFontWeight?: string
  itemFontFamily?: string
  priceFontSize?: number
  priceColor?: RgbaColor
  priceFontWeight?: string
  priceFontFamily?: string
  descriptionFontFamily?: string
  descriptionColor?: RgbaColor
  showImage?: boolean
}

export default function FeaturedBlock({
  items,
  backgroundColor,
  backgroundMode,
  itemFontFamily
}: FeaturedBlockProps) {
  const {
    connectors: { connect }
  } = useNode()
  const { isEditing } = useEditor(state => ({
    isEditing: state.options.enabled
  }))

  if (!items?.length) return <div>No hay elementos destacados</div>

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
      className={cn(
        "w-full @container/feat",
        backgroundMode === "none" ? "px-2 py-0" : "p-2"
      )}
    >
      <Carousel
        opts={{
          align: "start",
          loop: true
        }}
        className="w-full"
      >
        <CarouselContent>
          {items.map(item => (
            <CarouselItem
              key={item.id}
              className="@md/feat:basis-1/2 @lg/feat:basis-1/3"
            >
              <div>
                <div className="p-0">
                  <div className="relative flex h-40 flex-col justify-end overflow-hidden rounded-lg border border-white/10">
                    {item.image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("/bg/leaf.svg")`,
                          backgroundColor: `rgba(${Object.values(backgroundColor ?? { r: 0, g: 0, b: 0, a: 1 })}`
                        }}
                      />
                    )}
                    <div className="relative z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <FontWrapper
                        fontFamily={itemFontFamily}
                        className="flex flex-row gap-3"
                      >
                        <h3 className="text-lg font-semibold text-white">
                          {item.name}
                        </h3>
                      </FontWrapper>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

FeaturedBlock.craft = {
  displayName: "Destacados",
  props: {
    backgroundMode: "none",
    itemFontSize: 16,
    itemColor: { r: 38, g: 50, b: 56, a: 1 },
    itemFontWeight: "500",
    itemFontFamily: "Inter",
    priceFontSize: 14,
    priceColor: { r: 38, g: 50, b: 56, a: 1 },
    priceFontWeight: "400",
    priceFontFamily: "Inter",
    descriptionFontFamily: "Inter",
    descriptionColor: { r: 38, g: 50, b: 56, a: 1 },
    showImage: true
  },
  related: {
    settings: FeaturedSettings
  }
}
