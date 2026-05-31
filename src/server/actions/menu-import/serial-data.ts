import lz from "lzutf8"

import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import type { MenuImportGeneratedColorTheme } from "@/lib/types/menu-import"

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

function createCategoryNode({
  category,
  colorTheme
}: {
  category: SerializedMenuCategory
  colorTheme: MenuImportGeneratedColorTheme
}) {
  const textColor = hexToRgba(colorTheme.textColor)
  const accentColor = hexToRgba(colorTheme.accentColor)
  const mutedColor = hexToRgba(colorTheme.mutedColor)

  return {
    type: { resolvedName: "CategoryBlock" },
    isCanvas: false,
    props: {
      backgroundMode: "none",
      categoryFontSize: 24,
      categoryColor: accentColor,
      categoryFontWeight: "700",
      categoryFontFamily: "Outfit",
      categoryTextAlign: "center",
      categoryHeadingBgColor: colorTheme.surfaceColor,
      categoryHeadingShape: "none",
      itemFontSize: 16,
      itemColor: textColor,
      itemFontWeight: "500",
      itemFontFamily: "Outfit",
      priceFontSize: 14,
      priceColor: textColor,
      priceFontWeight: "700",
      priceFontFamily: "Outfit",
      descriptionFontFamily: "Outfit",
      descriptionColor: mutedColor,
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
  backgroundImage,
  colorTheme,
  categories
}: {
  organization: Organization
  location: Location | null
  backgroundImage: string
  colorTheme: MenuImportGeneratedColorTheme
  categories: SerializedMenuCategory[]
}) {
  const headerId = createNodeId("header", 0)
  const categoryNodeIds = categories.map((_, index) =>
    createNodeId("category", index)
  )
  const surfaceColor = hexToRgba(colorTheme.surfaceColor)
  const textColor = hexToRgba(colorTheme.textColor)
  const brandColor = hexToRgba(colorTheme.brandColor)

  const nodes = {
    ROOT: {
      type: { resolvedName: "ContainerBlock" },
      isCanvas: true,
      props: {
        backgroundColor: surfaceColor,
        backgroundImage,
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
        fontFamily: "Outfit",
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
            colorTheme
          })
        ]
      })
    )
  }

  return lz.encodeBase64(lz.compress(JSON.stringify(nodes)))
}
