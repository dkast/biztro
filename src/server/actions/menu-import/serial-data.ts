import lz from "lzutf8"

import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import type {
  MenuImportCategoryDesignPattern,
  MenuImportGeneratedColorTheme,
  MenuImportVisualPackage
} from "@/lib/types/menu-import"
import type { FontTheme } from "@/lib/types/theme"

type RgbaColor = { r: number; g: number; b: number; a: number }

export type SerializedMenuVariant = {
  id: string
  name: string
  description: string | null
  price: number
  createdAt: Date | string
  updatedAt: Date | string
  menuItemId: string
}

export type SerializedMenuItem = {
  id: string
  name: string
  description: string | null
  image: string | null
  imageAssetId: string | null
  status: string
  featured: boolean
  createdAt: Date | string
  updatedAt: Date | string
  categoryId: string | null
  organizationId: string
  allergens: string | null
  currency: "MXN" | "USD"
  variants: SerializedMenuVariant[]
}

export type SerializedMenuCategory = {
  id: string
  name: string
  createdAt: Date | string
  updatedAt: Date | string
  organizationId: string
  menuItems: SerializedMenuItem[]
}

type Organization = NonNullable<
  Awaited<ReturnType<typeof getCurrentOrganization>>
>
type Location = Awaited<ReturnType<typeof getDefaultLocation>>

function hexToRgba(hex: string): RgbaColor {
  const normalized = hex.replace("#", "")
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
    a: 1
  }
}

function createNodeId(prefix: string, index: number) {
  return `${prefix}-${index}-${crypto.randomUUID().slice(0, 8)}`
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

function findCategoryDesign({
  category,
  categoryDesigns
}: {
  category: SerializedMenuCategory
  categoryDesigns: MenuImportCategoryDesignPattern[]
}) {
  const categoryName = normalizeName(category.name)

  return categoryDesigns.find(design => {
    const designCategoryName = normalizeName(design.categoryName)

    return (
      categoryName === designCategoryName ||
      categoryName.includes(designCategoryName) ||
      designCategoryName.includes(categoryName)
    )
  })
}

function toRgbaColor(color: string | undefined, fallback: RgbaColor) {
  return color ? hexToRgba(color) : fallback
}

function createCategoryNode({
  category,
  fontTheme,
  colorTheme,
  categoryDesign
}: {
  category: SerializedMenuCategory
  fontTheme: FontTheme
  colorTheme: MenuImportGeneratedColorTheme
  categoryDesign?: MenuImportCategoryDesignPattern
}) {
  const textColor = hexToRgba(colorTheme.textColor)
  const accentColor = hexToRgba(colorTheme.accentColor)
  const mutedColor = hexToRgba(colorTheme.mutedColor)
  const headingBackgroundColor =
    categoryDesign?.headingBackgroundColor ?? colorTheme.surfaceColor
  const headingShape =
    categoryDesign?.headingShape ??
    (categoryDesign?.headingBackgroundColor ? "rounded" : "none")

  return {
    type: { resolvedName: "CategoryBlock" },
    isCanvas: false,
    props: {
      backgroundMode: "none",
      categoryFontSize: 24,
      categoryColor: toRgbaColor(categoryDesign?.headingTextColor, accentColor),
      categoryFontWeight: "700",
      categoryFontFamily: fontTheme.fontDisplay,
      categoryTextAlign: "center",
      categoryHeadingBgColor: headingBackgroundColor,
      categoryHeadingShape: headingShape,
      itemFontSize: 16,
      itemColor: toRgbaColor(categoryDesign?.itemTextColor, textColor),
      itemFontWeight: "500",
      itemFontFamily: fontTheme.fontDisplay,
      priceFontSize: 14,
      priceColor: toRgbaColor(categoryDesign?.priceTextColor, textColor),
      priceFontWeight: "700",
      priceFontFamily: fontTheme.fontText,
      descriptionFontFamily: fontTheme.fontText,
      descriptionColor: toRgbaColor(
        categoryDesign?.descriptionTextColor,
        mutedColor
      ),
      showImage: false,
      data: category
    },
    displayName: "Categoría",
    custom: {
      iconKey: "category",
      displayName: category.name
    },
    parent: "ROOT",
    hidden: false,
    nodes: [],
    linkedNodes: {}
  }
}

export function buildGeneratedMenuSerialData({
  organization,
  location,
  visualPackage,
  fontTheme,
  categories
}: {
  organization: Organization
  location: Location | null
  visualPackage: MenuImportVisualPackage
  fontTheme: FontTheme
  categories: SerializedMenuCategory[]
}) {
  const headerId = createNodeId("header", 0)
  const categoryNodeIds = categories.map((_, index) =>
    createNodeId("category", index)
  )
  const colorTheme = visualPackage.colorTheme
  const surfaceColor = hexToRgba(colorTheme.surfaceColor)
  const textColor = hexToRgba(colorTheme.textColor)
  const brandColor = hexToRgba(colorTheme.brandColor)

  const nodes = {
    ROOT: {
      type: { resolvedName: "ContainerBlock" },
      isCanvas: true,
      props: {
        backgroundColor: surfaceColor,
        backgroundImage: visualPackage.backgroundImage,
        color: textColor
      },
      displayName: "Sitio",
      custom: {},
      hidden: false,
      nodes: [headerId, ...categoryNodeIds],
      linkedNodes: {}
    },
    [headerId]: {
      type: { resolvedName: "HeaderBlock" },
      isCanvas: false,
      props: {
        fontFamily: fontTheme.fontDisplay,
        color: textColor,
        accentColor: brandColor,
        backgroundColor: surfaceColor,
        showBanner: Boolean(organization.banner?.trim()),
        showLogo: Boolean(organization.logo?.trim()),
        showAddress: true,
        showSocialMedia: true,
        organization,
        location: location ?? undefined
      },
      displayName: "Cabecera",
      custom: {
        iconKey: "header"
      },
      parent: "ROOT",
      hidden: false,
      nodes: [],
      linkedNodes: {}
    },
    ...Object.fromEntries(
      categories.map((category, index) => {
        const nodeId = categoryNodeIds[index]
        if (!nodeId) throw new Error("Missing generated category node id")

        return [
          nodeId,
          createCategoryNode({
            category,
            fontTheme,
            colorTheme,
            categoryDesign: findCategoryDesign({
              category,
              categoryDesigns: visualPackage.categoryDesigns
            })
          })
        ]
      })
    )
  }

  return lz.encodeBase64(lz.compress(JSON.stringify(nodes)))
}
