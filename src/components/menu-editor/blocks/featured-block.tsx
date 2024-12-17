"use client"

import { useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"
import Autoplay from "embla-carousel-autoplay"

import FeaturedSettings from "@/components/menu-editor/blocks/featured-settings"
import { ItemDetail } from "@/components/menu-editor/blocks/item-detail"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export type FeaturedBlockProps = {
  items: Prisma.MenuItemGetPayload<{
    include: {
      variants: true
    }
  }>[]
  backgroundColor?: RgbaColor
  itemFontFamily?: string
  itemFontWeight?: string
  descriptionFontFamily?: string
  priceFontFamily?: string
  priceFontWeight?: string
  autoPlay?: boolean
}

export default function FeaturedBlock({
  items,
  backgroundColor,
  itemFontFamily = "Inter",
  itemFontWeight = "500",
  descriptionFontFamily = "Inter",
  priceFontFamily = "Inter",
  priceFontWeight = "400",
  autoPlay = true
}: FeaturedBlockProps) {
  const {
    connectors: { connect }
  } = useNode()
  const { isEditing } = useEditor(state => ({
    isEditing: state.options.enabled
  }))

  const [selectedItem, setSelectedItem] = useState<(typeof items)[0] | null>(
    null
  )

  if (!items?.length) return <div>No hay elementos destacados</div>

  return (
    <>
      <div
        ref={ref => {
          if (ref) {
            connect(ref)
          }
        }}
        className="w-full p-2 @container/feat"
      >
        <Carousel
          opts={{
            align: "center",
            loop: true
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              playOnInit: autoPlay && !isEditing
            })
          ]}
          className="w-full"
        >
          <CarouselContent>
            {items.map(item => (
              <CarouselItem
                key={item.id}
                className="@md/feat:basis-1/2 @lg/feat:basis-1/3"
              >
                <div
                  onClick={() => !isEditing && setSelectedItem(item)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !isEditing) {
                      setSelectedItem(item)
                      e.preventDefault()
                    }
                  }}
                  className={cn("cursor-pointer", isEditing && "cursor-move")}
                  role="button"
                  tabIndex={0}
                >
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
                            backgroundImage: "url('/bg/leaf.svg')",
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

      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          itemFontFamily={itemFontFamily}
          itemFontWeight={itemFontWeight}
          descriptionFontFamily={descriptionFontFamily}
          priceFontFamily={priceFontFamily}
          priceFontWeight={priceFontWeight}
        />
      )}
    </>
  )
}

FeaturedBlock.craft = {
  displayName: "Destacados",
  props: {
    autoPlay: true,
    itemFontWeight: "500",
    itemFontFamily: "Inter",
    priceFontWeight: "400",
    priceFontFamily: "Inter",
    descriptionFontFamily: "Inter"
  },
  related: {
    settings: FeaturedSettings
  }
}
