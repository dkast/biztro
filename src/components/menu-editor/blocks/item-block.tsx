"use client"

import { useEffect, useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"
import Image from "next/image"

import { Allergens } from "@/components/menu-editor/blocks/item-allergens"
import { ItemDetail } from "@/components/menu-editor/blocks/item-detail"
import ItemSettings from "@/components/menu-editor/blocks/item-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import type { getMenuItemsWithoutCategory } from "@/server/actions/item/queries"
import { formatPrice, resolveCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"

export type ItemBlockProps = {
  item: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>[0]
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
  isEditing?: boolean
}

export default function ItemBlock({
  item,
  backgroundMode,
  itemFontSize,
  itemColor,
  itemFontWeight,
  itemFontFamily,
  priceFontSize,
  priceColor,
  priceFontWeight,
  priceFontFamily,
  descriptionFontFamily,
  descriptionColor,
  showImage
}: ItemBlockProps) {
  const {
    connectors: { connect },
    actions: { setCustom }
  } = useNode()

  useEffect(() => {
    if (!item?.name) return

    setCustom((custom: { displayName?: string }) => {
      custom.displayName = item.name
    })
  }, [item?.name, setCustom])

  const { isEditing } = useEditor(state => ({
    isEditing: state.options.enabled
  }))

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
      className={cn(backgroundMode === "none" ? "px-2 py-0" : "p-2")}
    >
      {item && (
        <ItemView
          {...{
            item,
            backgroundMode,
            itemFontSize,
            itemColor,
            itemFontWeight,
            itemFontFamily,
            priceFontSize,
            priceColor,
            priceFontWeight,
            priceFontFamily,
            descriptionFontFamily,
            descriptionColor,
            showImage,
            isEditing
          }}
        />
      )}
    </div>
  )
}

export function ItemView({
  item,
  backgroundMode,
  itemFontSize,
  itemColor,
  itemFontWeight,
  itemFontFamily,
  priceFontSize,
  priceColor,
  priceFontWeight,
  priceFontFamily,
  descriptionFontFamily,
  descriptionColor,
  showImage,
  isEditing
}: ItemBlockProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const hasVariants = item.variants.length > 1

  return (
    <>
      <div
        onClick={() => !isEditing && setIsDetailOpen(true)}
        onKeyDown={e => {
          if (e.key === "Enter" && !isEditing) {
            setIsDetailOpen(true)
            e.preventDefault()
          }
        }}
        className={cn(
          "cursor-pointer rounded-xl p-3 transition-colors hover:bg-black/5",
          backgroundMode === "dark" && "bg-black/50 backdrop-blur-md",
          backgroundMode === "light" && "bg-white/50 backdrop-blur-md",
          isEditing && "cursor-default hover:bg-transparent"
        )}
        role="button"
        tabIndex={0}
      >
        <div
          className={cn(
            "flex flex-row justify-between gap-2",
            hasVariants ? "items-start" : "items-center"
          )}
        >
          <div
            className={cn(
              "flex gap-3",
              hasVariants ? "flex-col-reverse" : "flex-row items-center"
            )}
          >
            {item.image && showImage && (
              <Image
                src={item.image}
                width={128}
                height={96}
                alt={item.name}
                className="h-16 w-20 rounded-sm object-cover"
                unoptimized
              ></Image>
            )}
            <div>
              <FontWrapper fontFamily={itemFontFamily}>
                <div className="flex flex-row gap-3">
                  <h3
                    style={{
                      fontSize: `${itemFontSize}px`,
                      color: `rgba(${Object.values(itemColor ?? { r: 0, g: 0, b: 0, a: 1 })})`,
                      fontWeight: itemFontWeight
                    }}
                  >
                    {item.name}
                  </h3>

                  {item.allergens && (
                    <div
                      style={{
                        color: `rgba(${Object.values(itemColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
                      }}
                    >
                      <Allergens allergens={item.allergens.split(",")} />
                    </div>
                  )}
                </div>
              </FontWrapper>
              <FontWrapper fontFamily={descriptionFontFamily}>
                <span
                  className="line-clamp-3 text-sm text-pretty"
                  style={{
                    color: `rgba(${Object.values(descriptionColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
                  }}
                >
                  {item.description}
                </span>
              </FontWrapper>
            </div>
          </div>
          {item.variants.length > 1 ? (
            <div className="flex flex-col justify-end gap-1 self-end">
              {item.variants.map(variant => (
                <div
                  key={variant.id}
                  className="grid grid-cols-[1fr_60px] gap-1 text-right"
                >
                  <FontWrapper fontFamily={descriptionFontFamily}>
                    <span
                      className="text-sm"
                      style={{
                        color: `rgba(${Object.values(descriptionColor ?? { r: 0, g: 0, b: 0, a: 1 })})`
                      }}
                    >
                      {variant.name}
                    </span>
                  </FontWrapper>
                  <FontWrapper fontFamily={priceFontFamily}>
                    <span
                      style={{
                        fontFamily: priceFontFamily,
                        fontSize: `${priceFontSize}px`,
                        color: `rgba(${Object.values(priceColor ?? { r: 0, g: 0, b: 0, a: 1 })})`,
                        fontWeight: priceFontWeight
                      }}
                      className="text-nowrap"
                    >
                      {formatPrice(
                        variant.price,
                        resolveCurrency(
                          (item as unknown as { currency?: string }).currency
                        )
                      )}
                    </span>
                  </FontWrapper>
                </div>
              ))}
            </div>
          ) : (
            <FontWrapper fontFamily={priceFontFamily}>
              <span
                style={{
                  fontFamily: priceFontFamily,
                  fontSize: `${priceFontSize}px`,
                  color: `rgba(${Object.values(priceColor ?? { r: 0, g: 0, b: 0, a: 1 })})`,
                  fontWeight: priceFontWeight
                }}
                className="text-nowrap"
              >
                {/* If it has decimal values, show them in the price as well with 2 decimal places */}
                {formatPrice(
                  (item.variants[0]?.price ?? 0) as number,
                  resolveCurrency(
                    (item as unknown as { currency?: string }).currency
                  )
                )}
              </span>
            </FontWrapper>
          )}
        </div>
      </div>
      <ItemDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={item}
        itemFontWeight={itemFontWeight ?? "400"}
        itemFontFamily={itemFontFamily ?? "Inter"}
        priceFontWeight={priceFontWeight ?? "400"}
        priceFontFamily={priceFontFamily ?? "Inter"}
        descriptionFontFamily={descriptionFontFamily ?? "Inter"}
      />
    </>
  )
}

ItemBlock.craft = {
  displayName: "Producto",
  props: {
    backgroundMode: "none",
    categoryFontSize: 20,
    categoryColor: { r: 38, g: 50, b: 56, a: 1 },
    categoryFontWeight: "700",
    categoryFontFamily: "Inter",
    categoryTextAlign: "left",
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
  custom: {
    iconKey: "item"
  },
  related: {
    settings: ItemSettings
  }
}
