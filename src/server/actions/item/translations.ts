"use server"

import * as Sentry from "@sentry/nextjs"
import { gateway, generateText, Output } from "ai"
import { cacheTag, updateTag } from "next/cache"
import { z } from "zod/v4"

import { isProMember } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  SUPPORTED_LOCALE_CODES,
  SUPPORTED_LOCALES,
  type SupportedLocaleCode
} from "@/lib/types/translations"
import { env } from "@/env.mjs"

const translateMenuItemsInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES)
})

const categoryTranslationSchema = z.object({
  categoryId: z.string().describe("Original category ID"),
  name: z.string().describe("Translated category name")
})

const translationOutputSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string().describe("Original menu item ID"),
      name: z.string().describe("Translated item name"),
      description: z
        .string()
        .optional()
        .describe("Translated item description"),
      variants: z.array(
        z.object({
          variantId: z.string().describe("Original variant ID"),
          name: z.string().describe("Translated variant name"),
          description: z
            .string()
            .optional()
            .describe("Translated variant description")
        })
      )
    })
  ),
  categories: z.array(categoryTranslationSchema)
})

const translateMenuItemForLocaleInputSchema = z.object({
  itemId: z.string(),
  locale: z.enum(SUPPORTED_LOCALE_CODES)
})

const itemTranslationOutputSchema = z.object({
  item: z
    .object({
      menuItemId: z.string().describe("Original menu item ID"),
      name: z.string().describe("Translated item name"),
      description: z.string().optional().describe("Translated item description")
    })
    .nullable(),
  variants: z.array(
    z.object({
      variantId: z.string().describe("Original variant ID"),
      name: z.string().describe("Translated variant name"),
      description: z
        .string()
        .optional()
        .describe("Translated variant description")
    })
  )
})

/**
 * Bulk-translate all active menu items for the current organization into the
 * specified locale using the AI Gateway.
 */
export const translateMenuItems = authMemberActionClient
  .inputSchema(translateMenuItemsInputSchema)
  .action(async ({ parsedInput: { locale }, ctx: { member } }) => {
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: { reason: "No se pudo obtener la organización actual" }
      }
    }

    const proMember = await isProMember()
    if (!proMember) {
      return {
        failure: {
          reason: "La traducción de menú es una función exclusiva del plan Pro"
        }
      }
    }

    if (!env.AI_GATEWAY_API_KEY) {
      return {
        failure: {
          reason:
            "La funcionalidad de traducción requiere configurar una clave de API del AI Gateway"
        }
      }
    }

    // Load all active items with variants
    const items = await prisma.menuItem.findMany({
      where: { organizationId: currentOrgId, status: "ACTIVE" },
      include: { variants: true }
    })

    // Load all categories for this organization
    const categories = await prisma.category.findMany({
      where: { organizationId: currentOrgId }
    })

    if (items.length === 0) {
      return {
        failure: {
          reason: "No hay productos activos para traducir"
        }
      }
    }

    const localeName =
      SUPPORTED_LOCALES.find(l => l.code === locale)?.label ?? locale

    const itemsPayload = items.map(item => ({
      menuItemId: item.id,
      name: item.name,
      description: item.description ?? undefined,
      variants: item.variants.map(v => ({
        variantId: v.id,
        name: v.name,
        description: v.description ?? undefined
      }))
    }))

    const categoriesPayload = categories.map(cat => ({
      categoryId: cat.id,
      name: cat.name
    }))

    try {
      const result = await generateText({
        model: gateway("mistral/mistral-small-latest"),
        output: Output.object({ schema: translationOutputSchema }),
        messages: [
          {
            role: "user",
            content: `You are a professional restaurant menu translator. Translate the following menu items and categories from their original language to ${localeName} (locale: ${locale}).

Rules:
- Translate names and descriptions naturally; preserve proper nouns (brand names, specific ingredient names) when appropriate.
- If a field is empty or undefined, leave it empty in the output.
- Return exactly the same IDs (menuItemId, variantId, categoryId) without modification.
- Keep translations concise and appropriate for a restaurant menu.

Categories to translate:
${JSON.stringify(categoriesPayload, null, 2)}

Menu items to translate:
${JSON.stringify(itemsPayload, null, 2)}`
          }
        ]
      })

      if (!result.output) {
        return {
          failure: { reason: "No se pudo obtener la traducción del modelo" }
        }
      }

      // Upsert translations in the database — run all upserts in parallel
      // batches within a single transaction to reduce sequential round-trips.
      await prisma.$transaction(async tx => {
        const itemUpserts = result.output.items.map(translatedItem =>
          tx.menuItemTranslation.upsert({
            where: {
              menuItemId_locale: {
                menuItemId: translatedItem.menuItemId,
                locale
              }
            },
            update: {
              name: translatedItem.name,
              description: translatedItem.description ?? null
            },
            create: {
              menuItemId: translatedItem.menuItemId,
              locale,
              name: translatedItem.name,
              description: translatedItem.description ?? null
            }
          })
        )

        const variantUpserts = result.output.items.flatMap(translatedItem =>
          translatedItem.variants.map(translatedVariant =>
            tx.variantTranslation.upsert({
              where: {
                variantId_locale: {
                  variantId: translatedVariant.variantId,
                  locale
                }
              },
              update: {
                name: translatedVariant.name,
                description: translatedVariant.description ?? null
              },
              create: {
                variantId: translatedVariant.variantId,
                locale,
                name: translatedVariant.name,
                description: translatedVariant.description ?? null
              }
            })
          )
        )

        const categoryUpserts = result.output.categories.map(
          translatedCategory =>
            tx.categoryTranslation.upsert({
              where: {
                categoryId_locale: {
                  categoryId: translatedCategory.categoryId,
                  locale
                }
              },
              update: { name: translatedCategory.name },
              create: {
                categoryId: translatedCategory.categoryId,
                locale,
                name: translatedCategory.name
              }
            })
        )

        await Promise.all([
          ...itemUpserts,
          ...variantUpserts,
          ...categoryUpserts
        ])
      })

      updateTag(`translations-${currentOrgId}`)

      return {
        success: {
          locale,
          count: result.output.items.length
        }
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "menu-translate" }
      })
      return {
        failure: {
          reason:
            "No se pudo completar la traducción. Por favor intenta nuevamente."
        }
      }
    }
  })

/**
 * Translate only the missing translations for a single menu item in a specific
 * locale, including any missing variant translations for that item.
 */
export const translateMenuItemForLocale = authMemberActionClient
  .inputSchema(translateMenuItemForLocaleInputSchema)
  .action(async ({ parsedInput: { itemId, locale }, ctx: { member } }) => {
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: { reason: "No se pudo obtener la organización actual" }
      }
    }

    const proMember = await isProMember()
    if (!proMember) {
      return {
        failure: {
          reason:
            "La traducción automática por producto es una función exclusiva del plan Pro"
        }
      }
    }

    if (!env.AI_GATEWAY_API_KEY) {
      return {
        failure: {
          reason:
            "La funcionalidad de traducción requiere configurar una clave de API del AI Gateway"
        }
      }
    }

    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        organizationId: currentOrgId
      },
      include: {
        translations: {
          where: { locale }
        },
        variants: {
          include: {
            translations: {
              where: { locale }
            }
          }
        }
      }
    })

    if (!item) {
      return {
        failure: { reason: "No se pudo encontrar el producto a traducir" }
      }
    }

    const itemNeedsTranslation = item.translations.length === 0
    const variantsMissingTranslation = item.variants.filter(
      variant => variant.translations.length === 0
    )

    if (!itemNeedsTranslation && variantsMissingTranslation.length === 0) {
      return {
        failure: {
          reason:
            "Este producto ya tiene todas las traducciones disponibles para ese idioma"
        }
      }
    }

    const localeName =
      SUPPORTED_LOCALES.find(entry => entry.code === locale)?.label ?? locale

    const itemPayload = itemNeedsTranslation
      ? {
          menuItemId: item.id,
          name: item.name,
          description: item.description ?? undefined
        }
      : null

    const variantsPayload = variantsMissingTranslation.map(variant => ({
      variantId: variant.id,
      name: variant.name,
      description: variant.description ?? undefined
    }))

    try {
      const result = await generateText({
        model: gateway("mistral/mistral-small-latest"),
        output: Output.object({ schema: itemTranslationOutputSchema }),
        messages: [
          {
            role: "user",
            content: `You are a professional restaurant menu translator. Translate only the missing content for the following restaurant menu item into ${localeName} (locale: ${locale}).

Rules:
- Translate names and descriptions naturally; preserve proper nouns when appropriate.
- If the item payload is null, keep item as null in the response.
- Return exactly the same IDs (menuItemId, variantId) without modification.
- If a field is empty or undefined, leave it empty in the output.

Missing item translation to generate:
${JSON.stringify(itemPayload, null, 2)}

Missing variant translations to generate:
${JSON.stringify(variantsPayload, null, 2)}`
          }
        ]
      })

      if (!result.output) {
        return {
          failure: { reason: "No se pudo obtener la traducción del modelo" }
        }
      }

      let createdItemTranslation: {
        locale: SupportedLocaleCode
        name: string
        description: string | null
      } | null = null
      const createdVariantTranslations: Array<{
        variantId: string
        locale: SupportedLocaleCode
        name: string
        description: string | null
      }> = []

      const outputVariantsById = new Map(
        result.output.variants.map(variant => [variant.variantId, variant])
      )

      await prisma.$transaction(async tx => {
        if (itemPayload && result.output.item) {
          const upserted = await tx.menuItemTranslation.upsert({
            where: {
              menuItemId_locale: {
                menuItemId: item.id,
                locale
              }
            },
            create: {
              menuItemId: item.id,
              locale,
              name: result.output.item.name,
              description: result.output.item.description?.trim()
                ? result.output.item.description
                : null
            },
            update: {
              name: result.output.item.name,
              description: result.output.item.description?.trim()
                ? result.output.item.description
                : null
            }
          })

          createdItemTranslation = {
            locale: upserted.locale as SupportedLocaleCode,
            name: upserted.name,
            description: upserted.description
          }
        }

        for (const variant of variantsMissingTranslation) {
          const translatedVariant = outputVariantsById.get(variant.id)

          if (!translatedVariant) {
            continue
          }

          const upserted = await tx.variantTranslation.upsert({
            where: {
              variantId_locale: {
                variantId: variant.id,
                locale
              }
            },
            create: {
              variantId: variant.id,
              locale,
              name: translatedVariant.name,
              description: translatedVariant.description?.trim()
                ? translatedVariant.description
                : null
            },
            update: {
              name: translatedVariant.name,
              description: translatedVariant.description?.trim()
                ? translatedVariant.description
                : null
            }
          })

          createdVariantTranslations.push({
            variantId: upserted.variantId,
            locale: upserted.locale as SupportedLocaleCode,
            name: upserted.name,
            description: upserted.description
          })
        }
      })

      if (!createdItemTranslation && createdVariantTranslations.length === 0) {
        return {
          failure: {
            reason:
              "No se generaron nuevas traducciones para este producto. Intenta de nuevo."
          }
        }
      }

      updateTag(`translations-${currentOrgId}`)
      updateTag(`menu-item-${itemId}`)

      return {
        success: {
          locale,
          itemTranslation: createdItemTranslation,
          variantTranslations: createdVariantTranslations
        }
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "item-translate-single" },
        extra: { itemId, locale }
      })

      return {
        failure: {
          reason:
            "No se pudo completar la traducción del producto. Por favor intenta nuevamente."
        }
      }
    }
  })

const deleteMenuTranslationInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES)
})

const supportedLocaleCodeSet = new Set<string>(SUPPORTED_LOCALE_CODES)

/**
 * Delete all translations for a given locale for the current organization.
 */
export const deleteMenuTranslation = authMemberActionClient
  .inputSchema(deleteMenuTranslationInputSchema)
  .action(async ({ parsedInput: { locale }, ctx: { member } }) => {
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
      return {
        failure: { reason: "No se pudo obtener la organización actual" }
      }
    }

    try {
      // Delete all translation types explicitly: variant translations relate to
      // Variant (not MenuItemTranslation), so they are NOT cascade-deleted when
      // menu item translations are removed and must be deleted here directly.
      const orgItems = await prisma.menuItem.findMany({
        where: { organizationId: currentOrgId },
        select: { id: true, variants: { select: { id: true } } }
      })

      const orgCategories = await prisma.category.findMany({
        where: { organizationId: currentOrgId },
        select: { id: true }
      })

      const variantIds = orgItems.flatMap(item => item.variants.map(v => v.id))
      const itemIds = orgItems.map(item => item.id)
      const categoryIds = orgCategories.map(cat => cat.id)

      await prisma.$transaction([
        prisma.variantTranslation.deleteMany({
          where: { variantId: { in: variantIds }, locale }
        }),
        prisma.menuItemTranslation.deleteMany({
          where: { menuItemId: { in: itemIds }, locale }
        }),
        prisma.categoryTranslation.deleteMany({
          where: { categoryId: { in: categoryIds }, locale }
        })
      ])

      updateTag(`translations-${currentOrgId}`)

      return { success: true }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "menu-translate-delete" }
      })
      return {
        failure: { reason: "No se pudo eliminar la traducción." }
      }
    }
  })

/**
 * Get the list of locales that have at least one translation for the current organization.
 */
export async function getAvailableTranslations(organizationId: string) {
  "use cache"

  cacheTag(`translations-${organizationId}`)

  const rows = await prisma.menuItemTranslation.groupBy({
    by: ["locale"],
    where: {
      menuItem: { organizationId }
    },
    _count: { locale: true }
  })

  const isSupportedLocaleCode = (
    locale: string
  ): locale is SupportedLocaleCode => supportedLocaleCodeSet.has(locale)

  return rows
    .filter((row): row is typeof row & { locale: SupportedLocaleCode } =>
      isSupportedLocaleCode(row.locale)
    )
    .map(row => ({
      locale: row.locale,
      count: row._count.locale
    }))
}

/**
 * Get translations for all active menu items in a specific locale.
 * Used by the public menu page.
 */
export async function getMenuTranslationsByLocale(
  organizationId: string,
  locale: string
) {
  "use cache"

  cacheTag(`translations-${organizationId}`)

  const translations = await prisma.menuItemTranslation.findMany({
    where: {
      locale,
      menuItem: { organizationId, status: "ACTIVE" }
    }
  })

  const variantTranslations = await prisma.variantTranslation.findMany({
    where: {
      locale,
      variant: { menuItem: { organizationId, status: "ACTIVE" } }
    }
  })

  const categoryTranslations = await prisma.categoryTranslation.findMany({
    where: {
      locale,
      category: { organizationId }
    }
  })

  return {
    items: Object.fromEntries(
      translations.map(t => [
        t.menuItemId,
        { name: t.name, description: t.description }
      ])
    ),
    variants: Object.fromEntries(
      variantTranslations.map(t => [
        t.variantId,
        { name: t.name, description: t.description }
      ])
    ),
    categories: Object.fromEntries(
      categoryTranslations.map(t => [t.categoryId, { name: t.name }])
    )
  }
}
