"use server"

import { Prisma } from "@/generated/prisma-client/client"
import * as Sentry from "@sentry/nextjs"
import { updateTag } from "next/cache"
import sharp from "sharp"
import { z } from "zod/v4"

import { getDefaultLocation } from "@/server/actions/location/queries"
import {
  analyzeMenuVisualPackage,
  generateImportedMenuBackground
} from "@/server/actions/menu-import/ai"
import { createImportNameAllocator } from "@/server/actions/menu-import/item-names"
import {
  buildGeneratedMenuSerialData,
  type SerializedMenuCategory,
  type SerializedMenuItem
} from "@/server/actions/menu-import/serial-data"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { deleteObjectFromR2, putObjectToR2 } from "@/lib/r2"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  MediaAssetScope,
  MediaAssetType,
  MediaUsageEntityType
} from "@/lib/types/media"
import {
  menuImportFileInputSchema,
  type MenuImportGeneratedColorTheme
} from "@/lib/types/menu-import"
import { bulkMenuItemSchema, MenuItemStatus } from "@/lib/types/menu-item"
import { ThemeScope, ThemeType } from "@/lib/types/theme"
import { getCacheBustedImageUrl } from "@/lib/utils"
import { env } from "@/env.mjs"
import { CACHE_TAGS } from "../media/constants"

const createImportedMenuSchema = menuImportFileInputSchema.extend({
  menuName: z.string().max(80).optional(),
  items: bulkMenuItemSchema.min(1)
})

type BulkImportItem = z.infer<typeof bulkMenuItemSchema>[number]

type GroupedImportItem = {
  name: string
  description?: string
  status?: string
  category: string
  currency?: "MXN" | "USD"
  variants: { name: string; price: number }[]
}

type CreatedImportItem = Prisma.MenuItemGetPayload<{
  include: {
    category: true
    variants: {
      orderBy: {
        price: "asc"
      }
    }
  }
}>

function toMenuName(value: string | undefined, fallback: string) {
  const trimmed = value?.trim()
  if (trimmed) return trimmed

  return fallback.trim() || "Menú importado"
}

function groupImportItems(items: BulkImportItem[]) {
  const groupedItemsMap = new Map<string, GroupedImportItem>()

  for (const item of items) {
    const normalizedName = item.name.trim()
    if (!normalizedName) continue

    const itemKey = normalizedName.toLowerCase()
    const existingItem = groupedItemsMap.get(itemKey)
    const category = item.category?.trim() || "Menú"
    const nextVariantBaseName =
      item.variantName?.trim() ||
      (existingItem
        ? `Variante ${existingItem.variants.length + 1}`
        : "Regular")

    if (!existingItem) {
      groupedItemsMap.set(itemKey, {
        name: normalizedName,
        description: item.description?.trim() || undefined,
        status: item.status,
        category,
        currency: item.currency,
        variants: [{ name: nextVariantBaseName, price: item.price }]
      })
      continue
    }

    const nextVariantName = existingItem.variants.some(
      variant =>
        variant.name.toLowerCase() === nextVariantBaseName.toLowerCase()
    )
      ? `${nextVariantBaseName} ${existingItem.variants.length + 1}`
      : nextVariantBaseName

    existingItem.variants.push({ name: nextVariantName, price: item.price })

    if (!existingItem.description && item.description?.trim()) {
      existingItem.description = item.description.trim()
    }

    if (!existingItem.currency && item.currency) {
      existingItem.currency = item.currency
    }

    if (!existingItem.status && item.status) {
      existingItem.status = item.status
    }
  }

  return Array.from(groupedItemsMap.values())
}

async function createImportedItems({
  tx,
  organizationId,
  items,
  defaultCurrency
}: {
  tx: Prisma.TransactionClient
  organizationId: string
  items: GroupedImportItem[]
  defaultCurrency: "MXN" | "USD"
}) {
  const existingCategories = await tx.category.findMany({
    where: { organizationId }
  })
  const categoryMap = new Map(
    existingCategories.map(category => [
      category.name.toLowerCase(),
      category.id
    ])
  )
  const newCategoryNames = new Set<string>()

  for (const item of items) {
    if (!categoryMap.has(item.category.toLowerCase())) {
      newCategoryNames.add(item.category)
    }
  }

  if (newCategoryNames.size > 0) {
    await tx.category.createMany({
      data: Array.from(newCategoryNames).map(name => ({
        name,
        organizationId
      }))
    })
  }

  const updatedCategories = await tx.category.findMany({
    where: { organizationId }
  })
  const updatedCategoryMap = new Map(
    updatedCategories.map(category => [
      category.name.toLowerCase(),
      category.id
    ])
  )
  const existingItems = await tx.menuItem.findMany({
    where: { organizationId },
    select: { name: true }
  })
  const allocateItemName = createImportNameAllocator(
    existingItems.map(item => item.name)
  )
  const createdItems: CreatedImportItem[] = []

  for (const item of items) {
    const categoryId = updatedCategoryMap.get(item.category.toLowerCase())

    createdItems.push(
      await tx.menuItem.create({
        data: {
          name: allocateItemName(item.name),
          description: item.description || "",
          status: item.status || MenuItemStatus.ACTIVE,
          categoryId,
          currency: item.currency ?? defaultCurrency,
          organizationId,
          variants: {
            create: item.variants.map(variant => ({
              name: variant.name,
              price: variant.price
            }))
          }
        },
        include: {
          category: true,
          variants: {
            orderBy: {
              price: "asc"
            }
          }
        }
      })
    )
  }

  return createdItems
}

function toSerializedItem(item: CreatedImportItem): SerializedMenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    image: item.image,
    imageAssetId: item.imageAssetId,
    status: item.status,
    featured: item.featured,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    categoryId: item.categoryId,
    organizationId: item.organizationId,
    allergens: item.allergens,
    currency: item.currency,
    variants: item.variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      description: variant.description,
      price: variant.price,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      menuItemId: variant.menuItemId
    }))
  }
}

function buildSerializedCategories(items: CreatedImportItem[]) {
  const categories = new Map<string, SerializedMenuCategory>()

  for (const item of items) {
    if (!item.category) continue

    const existingCategory = categories.get(item.category.id)
    const serializedItem = toSerializedItem(item)

    if (existingCategory) {
      existingCategory.menuItems.push(serializedItem)
      continue
    }

    categories.set(item.category.id, {
      id: item.category.id,
      name: item.category.name,
      createdAt: item.category.createdAt,
      updatedAt: item.category.updatedAt,
      organizationId: item.category.organizationId,
      menuItems: [serializedItem]
    })
  }

  return Array.from(categories.values())
}

function buildThemeJSON({
  themeId,
  colorTheme
}: {
  themeId: string
  colorTheme: MenuImportGeneratedColorTheme
}) {
  return JSON.stringify({
    id: themeId,
    name: colorTheme.name,
    surfaceColor: colorTheme.surfaceColor,
    brandColor: colorTheme.brandColor,
    accentColor: colorTheme.accentColor,
    textColor: colorTheme.textColor,
    mutedColor: colorTheme.mutedColor,
    scope: ThemeScope.USER,
    tags: ["ai-import", "generated"]
  })
}

async function optimizeGeneratedBackground(
  image: Awaited<ReturnType<typeof generateImportedMenuBackground>>
) {
  const width = 1080
  const height = 1920
  const { data, info } = await sharp(Buffer.from(image.uint8Array))
    .resize({
      width,
      height,
      fit: "cover",
      position: "center"
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    bytes: data.byteLength,
    contentType: "image/webp",
    width: info.width,
    height: info.height
  }
}

export const createMenuFromImport = authMemberActionClient
  .inputSchema(createImportedMenuSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    if (!(await isProMember())) {
      return {
        failure: {
          reason: "La creación de menús completos desde archivo requiere Pro"
        }
      }
    }

    if (!parsedInput.simulateResponse && !env.AI_GATEWAY_API_KEY) {
      return {
        failure: {
          reason:
            "La generación visual requiere configurar una clave de API del AI Gateway"
        }
      }
    }

    const currentOrg = await getCurrentOrganization()
    if (!currentOrg || currentOrg.id !== organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    const groupedItems = groupImportItems(parsedInput.items)
    if (groupedItems.length === 0) {
      return {
        failure: {
          reason: "Agrega al menos un producto con nombre"
        }
      }
    }

    let storageKey: string | null = null

    try {
      const visualPackage = await analyzeMenuVisualPackage(parsedInput)
      const generatedImage = await generateImportedMenuBackground({
        fileBase64: parsedInput.fileBase64,
        mimeType: parsedInput.mimeType,
        simulateResponse: parsedInput.simulateResponse,
        visualPackage
      })
      const optimizedImage = await optimizeGeneratedBackground(generatedImage)
      const menuId = crypto.randomUUID()
      const themeId = crypto.randomUUID()
      storageKey = `orgs/${organizationId}/menus/${menuId}/background`
      const generatedStorageKey = storageKey
      const backgroundUrl = getCacheBustedImageUrl(
        generatedStorageKey,
        new Date()
      )

      await putObjectToR2({
        key: generatedStorageKey,
        body: optimizedImage.buffer,
        contentType: optimizedImage.contentType
      })

      const defaultLocation = await getDefaultLocation(organizationId)
      const defaultCurrency = (defaultLocation?.currency ?? "MXN") as
        | "MXN"
        | "USD"

      const menu = await prisma.$transaction(async tx => {
        await tx.theme.create({
          data: {
            id: themeId,
            name: `${visualPackage.colorTheme.name} ${menuId.slice(0, 8)}`,
            scope: ThemeScope.USER,
            themeType: ThemeType.COLOR,
            themeJSON: buildThemeJSON({
              themeId,
              colorTheme: visualPackage.colorTheme
            }),
            organizationId
          }
        })

        const importedItems = await createImportedItems({
          tx,
          organizationId,
          items: groupedItems,
          defaultCurrency
        })
        const serializedCategories = buildSerializedCategories(importedItems)
        const serialData = buildGeneratedMenuSerialData({
          organization: currentOrg,
          location: defaultLocation,
          backgroundImage: backgroundUrl,
          colorTheme: visualPackage.colorTheme,
          categories: serializedCategories
        })
        const createdMenu = await tx.menu.create({
          data: {
            id: menuId,
            name: toMenuName(parsedInput.menuName, visualPackage.menuName),
            description: `Generado desde un menú importado. ${visualPackage.styleSummary}`,
            status: "DRAFT",
            organizationId,
            fontTheme: "TUCSON",
            colorTheme: themeId,
            serialData
          }
        })
        const asset = await tx.mediaAsset.upsert({
          where: { storageKey: generatedStorageKey },
          create: {
            organizationId,
            storageKey: generatedStorageKey,
            type: MediaAssetType.IMAGE,
            scope: MediaAssetScope.OTHER,
            bytes: optimizedImage.bytes,
            contentType: optimizedImage.contentType,
            width: optimizedImage.width,
            height: optimizedImage.height
          },
          update: {
            bytes: optimizedImage.bytes,
            contentType: optimizedImage.contentType,
            width: optimizedImage.width,
            height: optimizedImage.height,
            updatedAt: new Date(),
            deletedAt: null,
            unattachedAt: null
          }
        })

        await tx.mediaUsage.upsert({
          where: {
            assetId_entityType_entityId_field: {
              assetId: asset.id,
              entityType: MediaUsageEntityType.ORGANIZATION,
              entityId: organizationId,
              field: `menu-background-${menuId}`
            }
          },
          create: {
            assetId: asset.id,
            entityType: MediaUsageEntityType.ORGANIZATION,
            entityId: organizationId,
            field: `menu-background-${menuId}`
          },
          update: {
            updatedAt: new Date()
          }
        })

        return createdMenu
      })

      updateTag(`menus-${organizationId}`)
      updateTag(`menu-${menu.id}`)
      updateTag(`menu-items-${organizationId}`)
      updateTag(`categories-${organizationId}`)
      updateTag(CACHE_TAGS.mediaAssets(organizationId))
      updateTag(CACHE_TAGS.mediaCount(organizationId))
      updateTag(CACHE_TAGS.mediaBackgrounds(organizationId))

      return {
        success: {
          menu,
          itemCount: groupedItems.length
        }
      }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "menu-import-visual-generation" },
        extra: { organizationId }
      })

      if (storageKey) {
        try {
          await deleteObjectFromR2(storageKey)
        } catch (cleanupError) {
          console.error(cleanupError)
          Sentry.captureException(cleanupError, {
            tags: { section: "menu-import-r2-cleanup" },
            extra: { organizationId, storageKey }
          })
        }
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
          return {
            failure: {
              reason:
                "No se pudo crear el menú porque hay productos o temas duplicados"
            }
          }
        }
      }

      return {
        failure: {
          reason:
            "No se pudo generar el menú completo. Intenta nuevamente con un archivo más claro."
        }
      }
    }
  })
