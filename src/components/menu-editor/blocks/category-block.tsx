import { useEffect } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"

import CategorySettings from "@/components/menu-editor/blocks/category-settings"
import { ItemView } from "@/components/menu-editor/blocks/item-block"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import { cn } from "@/lib/utils"

// Helper to normalize color value (handles both hex string and legacy RgbaColor object)
function normalizeColor(
  color: string | { r: number; g: number; b: number; a?: number } | undefined
): string | undefined {
  if (!color) return undefined
  if (typeof color === "string") return color
  // Legacy RgbaColor object format
  const { r, g, b } = color
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`
}

export type CategoryHeadingShape =
  | "rectangle"
  | "rounded"
  | "pill"
  | "slanted"
  | "parallelogram"
  | "chevron"
  | "tab"
  | "scooped"
  | "ribbon"

export type CategoryBlockProps = {
  data: Awaited<ReturnType<typeof getCategoriesWithItems>>[0]
  backgroundMode: "none" | "custom"
  categoryFontSize?: number
  categoryColor?: RgbaColor
  categoryFontWeight?: string
  categoryFontFamily?: string
  categoryTextAlign?: string
  categoryHeadingBgColor?: string
  categoryHeadingShape?: CategoryHeadingShape
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
  categoryHeadingBgColor,
  categoryHeadingShape = "rectangle",
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
    connectors: { connect },
    actions: { setCustom },
    id
  } = useNode()

  useEffect(() => {
    if (!data?.name) return

    setCustom((custom: { displayName?: string }) => {
      custom.displayName = data.name
    })
  }, [data.name, setCustom])
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
      className={cn(
        "p-2",
        backgroundMode === "custom" && "bg-black/50 backdrop-blur-md"
      )}
    >
      <div>
        <h2
          id={id}
          className={cn(
            !normalizeColor(categoryHeadingBgColor) && "p-2",
            normalizeColor(categoryHeadingBgColor) && "heading-shape",
            normalizeColor(categoryHeadingBgColor) &&
              `heading-shape-${categoryHeadingShape}`
          )}
          style={
            {
              fontFamily: categoryFontFamily,
              fontSize: `${categoryFontSize}px`,
              color: `rgba(${Object.values(categoryColor ?? { r: 0, g: 0, b: 0, a: 1 })})`,
              fontWeight: categoryFontWeight,
              textAlign: categoryTextAlign as "right" | "left" | "center",
              lineHeight: `${(categoryFontSize ?? 12) * 1.8}px`,
              "--heading-bg-color": normalizeColor(categoryHeadingBgColor)
            } as React.CSSProperties
          }
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
                  backgroundMode: "none",
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
    categoryHeadingBgColor: undefined,
    categoryHeadingShape: "rectangle",
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
    iconKey: "category"
  },
  related: {
    settings: CategorySettings
  }
}
