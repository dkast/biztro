import { useNode } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"
import Image from "next/image"

import CategorySettings from "@/components/menu-editor/blocks/category-settings"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import { cn } from "@/lib/utils"

export type CategoryBlockProps = {
  data: Prisma.PromiseReturnType<typeof getCategoriesWithItems>[0]
  categoryFontSize?: number
  categoryColor?: RgbaColor
  categoryFontWeight?: string
  categoryFontFamily?: string
  categoryTextAlign?: string
  itemFontSize?: number
  itemColor?: RgbaColor
  itemFontWeight?: string
  itemFontFamily?: string
  priceFontSize?: number
  priceColor?: RgbaColor
  priceFontWeight?: string
  priceFontFamily?: string
  showImage?: boolean
}

export default function CategoryBlock({
  data,
  categoryFontSize,
  categoryColor,
  categoryFontWeight,
  categoryFontFamily,
  categoryTextAlign,
  itemFontSize,
  itemColor,
  itemFontWeight,
  itemFontFamily,
  priceFontSize,
  priceColor,
  priceFontWeight,
  priceFontFamily,
  showImage
}: CategoryBlockProps) {
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
      className="px-4"
    >
      <h2
        style={{
          fontSize: `${categoryFontSize}px`,
          color: `rgba(${Object.values(categoryColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
          fontWeight: categoryFontWeight,
          textAlign: categoryTextAlign as "right" | "left" | "center",
          lineHeight: `${(categoryFontSize ?? 12) * 1.8}px`
        }}
      >
        {data.name}
      </h2>
      <div className="space-y-4">
        {data.menuItems.map(item => {
          const hasVariants = item.variants.length > 1
          return (
            <div key={item.id}>
              <div
                className={cn(
                  "flex flex-row justify-between",
                  hasVariants ? "items-start" : "items-center"
                )}
              >
                <div className="flex flex-row gap-2">
                  {item.image && showImage && (
                    <Image
                      src={item.image}
                      width={128}
                      height={96}
                      alt={item.name}
                      layout="fixed"
                      className="h-16 w-20 rounded object-cover"
                      unoptimized
                    ></Image>
                  )}
                  <div>
                    <h3
                      style={{
                        fontSize: `${itemFontSize}px`,
                        color: `rgba(${Object.values(itemColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
                        fontWeight: itemFontWeight
                      }}
                    >
                      {item.name}
                    </h3>
                    <span className="line-clamp-3 text-sm">
                      {item.description}
                    </span>
                  </div>
                </div>
                {item.variants.length > 1 ? (
                  <div className="flex flex-col justify-end gap-1">
                    {item.variants.map(variant => (
                      <div
                        key={variant.id}
                        className="grid grid-cols-2 gap-1 text-right"
                      >
                        <span className="text-sm">{variant.name}</span>
                        <span
                          style={{
                            fontSize: `${priceFontSize}px`,
                            color: `rgba(${Object.values(priceColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
                            fontWeight: priceFontWeight
                          }}
                        >
                          {variant.price}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: `${priceFontSize}px`,
                      color: `rgba(${Object.values(priceColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
                      fontWeight: priceFontWeight
                    }}
                  >
                    {item.variants[0]?.price}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

CategoryBlock.craft = {
  displayName: "Categoría",
  props: {
    categoryFontSize: 18,
    categoryColor: { r: 38, g: 50, b: 56, a: 1 },
    categoryFontWeight: "600",
    categoryFontFamily: "Inter",
    categoryTextAlign: "left",
    itemFontSize: 16,
    itemColor: { r: 38, g: 50, b: 56, a: 1 },
    itemFontWeight: "500",
    itemFontFamily: "Inter",
    priceFontSize: 14,
    priceColor: { r: 38, g: 50, b: 56, a: 1 },
    priceFontWeight: "500",
    priceFontFamily: "Inter",
    showImage: true
  },
  related: {
    settings: CategorySettings
  }
}
