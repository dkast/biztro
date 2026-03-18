"use server"

import * as Sentry from "@sentry/nextjs"
import { gateway, generateText, Output } from "ai"
import { cacheTag, updateTag } from "next/cache"
import { z } from "zod/v4"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  SUPPORTED_LOCALES,
  type SupportedLocaleCode
} from "@/lib/types/translations"
import { env } from "@/env.mjs"

const translateMenuItemsInputSchema = z.object({
  locale: z.string().min(2).max(10)
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

    try {
      const result = await generateText({
        model: gateway("mistral/mistral-small-latest"),
        output: Output.object({ schema: translationOutputSchema }),
        messages: [
          {
            role: "user",
            content: `You are a professional restaurant menu translator. Translate the following menu items from their original language to ${localeName} (locale: ${locale}).

Rules:
- Translate names and descriptions naturally; preserve proper nouns (brand names, specific ingredient names) when appropriate.
- If a field is empty or undefined, leave it empty in the output.
- Return exactly the same IDs (menuItemId, variantId) without modification.
- Keep translations concise and appropriate for a restaurant menu.

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

      // Upsert translations in the database
      await prisma.$transaction(async tx => {
        for (const translatedItem of result.output.items) {
          await tx.menuItemTranslation.upsert({
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

          for (const translatedVariant of translatedItem.variants) {
            await tx.variantTranslation.upsert({
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
          }
        }
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

const deleteMenuTranslationInputSchema = z.object({
  locale: z.string().min(2).max(10)
})

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
      // Delete menu item translations (variant translations are cascade-deleted
      // by the DB but we need to handle them explicitly since they're on variants)
      const orgItems = await prisma.menuItem.findMany({
        where: { organizationId: currentOrgId },
        select: { id: true, variants: { select: { id: true } } }
      })

      const variantIds = orgItems.flatMap(item =>
        item.variants.map(v => v.id)
      )
      const itemIds = orgItems.map(item => item.id)

      await prisma.$transaction([
        prisma.variantTranslation.deleteMany({
          where: { variantId: { in: variantIds }, locale }
        }),
        prisma.menuItemTranslation.deleteMany({
          where: { menuItemId: { in: itemIds }, locale }
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

  return rows.map(row => ({
    locale: row.locale as string,
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
    )
  }
}

/**
 * Fetch translation availability for the current membership's organization.
 * Used by dashboard pages.
 */
export async function getAvailableTranslationsForCurrentOrg() {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId

  if (!currentOrg) {
    return []
  }

  return getAvailableTranslations(currentOrg)
}
