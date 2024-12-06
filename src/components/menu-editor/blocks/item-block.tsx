"use client"

import { useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"
import Image from "next/image"

import ItemSettings from "@/components/menu-editor/blocks/item-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import type { getMenuItemsWithoutCategory } from "@/server/actions/item/queries"
import { cn } from "@/lib/utils"
import { ItemDetail } from "./item-detail"

export type ItemBlockProps = {
  item: Prisma.PromiseReturnType<typeof getMenuItemsWithoutCategory>[0]
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
    connectors: { connect }
  } = useNode()
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
  related: {
    settings: ItemSettings
  }
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
                className="h-16 w-20 rounded object-cover"
                unoptimized
              ></Image>
            )}
            <div>
              <FontWrapper
                fontFamily={itemFontFamily}
                className="flex flex-row"
              >
                <h3
                  style={{
                    fontSize: `${itemFontSize}px`,
                    color: `rgba(${Object.values(itemColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
                    fontWeight: itemFontWeight
                  }}
                >
                  {item.name}
                </h3>

                {item.allergens && (
                  <div
                    style={{
                      color: `rgba(${Object.values(itemColor ?? { r: 0, g: 0, b: 0, a: 1 })}`
                    }}
                  >
                    <Allergens allergens={item.allergens.split(",")} />
                  </div>
                )}
              </FontWrapper>
              <FontWrapper fontFamily={descriptionFontFamily}>
                <span
                  className="line-clamp-3 text-pretty text-sm"
                  style={{
                    color: `rgba(${Object.values(descriptionColor ?? { r: 0, g: 0, b: 0, a: 1 })}`
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
                        color: `rgba(${Object.values(descriptionColor ?? { r: 0, g: 0, b: 0, a: 1 })}`
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
                        color: `rgba(${Object.values(priceColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
                        fontWeight: priceFontWeight
                      }}
                    >
                      {variant.price % 1 === 0
                        ? variant.price
                        : variant.price.toFixed(2)}
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
                  color: `rgba(${Object.values(priceColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
                  fontWeight: priceFontWeight
                }}
              >
                {/* If it has decimal values, show them in the price as well with 2 decimal places */}
                {(item.variants[0]?.price ?? 0) % 1 === 0
                  ? item.variants[0]?.price
                  : item.variants[0]?.price.toFixed(2)}
              </span>
            </FontWrapper>
          )}
        </div>
      </div>
      <ItemDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={item}
        {...{
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
        }}
      />
    </>
  )
}

type AllergenIcon = {
  [key: string]: React.ReactNode
}

const allergenIcons: AllergenIcon = {
  seafood: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M7.5 14A6 6 0 1 1 10 2.36L8 5l2 2S7 8 2 8" />
      <path d="M16.5 14A6 6 0 1 0 14 2.36L16 5l-2 2s3 1 8 1" />
      <path d="M10 13v-2" />
      <path d="M14 13v-2" />
      <ellipse cx="12" cy="17.5" rx="7" ry="4.5" />
      <path d="M2 16c2 0 3 1 3 1" />
      <path d="M2 22c0-1.7 1.3-3 3-3" />
      <path d="M19 17s1-1 3-1" />
      <path d="M19 19c1.7 0 3 1.3 3 3" />
    </svg>
  ),
  peanut: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M12 4V2" />
      <path d="M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4" />
      <path d="M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z" />
    </svg>
  ),
  lactose: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M8 2h8" />
      <path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2" />
      <path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
    </svg>
  ),
  nut: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M12 4V2" />
      <path d="M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4" />
      <path d="M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z" />
    </svg>
  ),
  gluten: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M2 22 16 8" />
      <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
      <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
      <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
      <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
    </svg>
  ),
  fish: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
      <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
      <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
    </svg>
  ),
  vegetarian: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M16 8q6 0 6-6-6 0-6 6" />
      <path d="M17.41 3.59a10 10 0 1 0 3 3" />
      <path d="M2 2a26.6 26.6 0 0 1 10 20c.9-6.82 1.5-9.5 4-14" />
    </svg>
  ),
  spicy: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="size-4"
    >
      <path d="M18 7V4a2 2 0 0 0-4 0" />
      <path d="M14 10s2 0 4 2c2-2 4-2 4-2" />
      <path d="M22 10c0 6.6-5.4 12-12 12-4.4 0-8-2.7-8-6v-.4C3.3 17.1 5 18 7 18c3.9 0 7-3.6 7-8 0-1.7 1.3-3 3-3h2c1.7 0 3 1.3 3 3" />
    </svg>
  )
}

function AllergenBadge({
  allergen,
  showLabel
}: {
  allergen: string
  showLabel?: boolean
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-1 text-xs">
      {allergenIcons[allergen.toLowerCase()] || null}
      {showLabel && allergen}
    </div>
  )
}

function Allergens({
  allergens,
  showLabel
}: {
  allergens: string[]
  showLabel?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {allergens.map(allergen => (
        <AllergenBadge
          key={allergen}
          allergen={allergen}
          showLabel={showLabel}
        />
      ))}
    </div>
  )
}
