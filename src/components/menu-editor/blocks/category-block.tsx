import { useNode } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import type { RgbaColor } from "@uiw/react-color"

import CategorySettings from "@/components/menu-editor/blocks/category-settings"
import { ItemView } from "@/components/menu-editor/blocks/item-block"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import { cn } from "@/lib/utils"

export type CategoryBlockProps = {
  data: Prisma.PromiseReturnType<typeof getCategoriesWithItems>[0]
  backgroundMode: "dark" | "light" | "none"
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
  descriptionFontFamily?: string
  descriptionColor?: RgbaColor
  showImage?: boolean
}

export default function CategoryBlock({
  data,
  backgroundMode,
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
  descriptionFontFamily,
  descriptionColor,
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
      className="p-2"
    >
      <div>
        <h2
          className="p-2"
          style={{
            fontFamily: categoryFontFamily,
            fontSize: `${categoryFontSize}px`,
            color: `rgba(${Object.values(categoryColor ?? { r: 0, g: 0, b: 0, a: 1 })}`,
            fontWeight: categoryFontWeight,
            textAlign: categoryTextAlign as "right" | "left" | "center",
            lineHeight: `${(categoryFontSize ?? 12) * 1.8}px`
          }}
        >
          {data.name}
        </h2>
        <div
          className={cn(backgroundMode === "none" ? "space-y-0" : "space-y-4")}
        >
          {data.menuItems.map(item => {
            return (
              <ItemView
                key={item.id}
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
                  showImage
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

CategoryBlock.craft = {
  displayName: "Categoría",
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
    settings: CategorySettings
  }
}
