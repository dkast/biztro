import { z } from "zod/v4"

import { SUPPORTED_LOCALE_CODES } from "@/lib/types/translations"

export const variantSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Nombre es requerido" : undefined
    })
    .min(3, {
      error: "Nombre muy corto"
    })
    .max(100, {
      error: "Nombre muy largo"
    }),
  description: z.string().optional(),
  price: z.number().min(0, { error: "Precio no puede ser negativo" }),
  menuItemId: z.string().optional(),
  translations: z
    .array(
      z.object({
        locale: z.enum(SUPPORTED_LOCALE_CODES),
        name: z
          .string({
            error: issue =>
              issue.input === undefined ? "Nombre es requerido" : undefined
          })
          .min(3, {
            error: "Nombre muy corto"
          })
          .max(100, {
            error: "Nombre muy largo"
          }),
        description: z.string().optional()
      })
    )
    .optional()
})

export const variantTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Nombre es requerido" : undefined
    })
    .min(3, {
      error: "Nombre muy corto"
    })
    .max(100, {
      error: "Nombre muy largo"
    }),
  description: z.string().optional()
})

export const variantFormTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z.string().optional(),
  description: z.string().optional()
})

export const menuItemTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Nombre es requerido" : undefined
    })
    .min(3, {
      error: "Nombre muy corto"
    })
    .max(100, {
      error: "Nombre muy largo"
    }),
  description: z.string().optional()
})

export const menuItemFormTranslationSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALE_CODES),
  name: z.string().optional(),
  description: z.string().optional()
})

export const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Nombre es requerido" : undefined
    })
    .min(3, {
      error: "Nombre muy corto"
    })
    .max(100, {
      error: "Nombre muy largo"
    }),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  description: z.string().optional(),
  image: z.url().optional(),
  categoryId: z.string().optional(),
  organizationId: z.string().optional(),
  featured: z.boolean().prefault(false).optional(),
  currency: z.enum(["MXN", "USD"]).default("MXN").optional(),
  variants: z.tuple([variantSchema], variantSchema),
  allergens: z.string().optional(),
  translations: z.array(menuItemTranslationSchema).optional(),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

export const menuItemFormSchema = menuItemSchema.extend({
  variants: z.tuple(
    [
      variantSchema.extend({
        translations: z.array(variantFormTranslationSchema).optional()
      })
    ],
    variantSchema.extend({
      translations: z.array(variantFormTranslationSchema).optional()
    })
  ),
  translations: z.array(menuItemFormTranslationSchema).optional()
})

export type MenuItemQueryFilter = {
  status?: string
  category?: string
  start?: string
  end?: string
  take?: number
}

export const enum MenuItemStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED"
}

export type BulkMenuItem = {
  name: string
  description?: string
  price: number
  variantName?: string
  status?: string
  category?: string
  currency?: "MXN" | "USD"
}

export const bulkMenuItemSchema = z.array(
  z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    variantName: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    currency: z.enum(["MXN", "USD"]).optional()
  })
)

export const Allergens = [
  { value: "SEAFOOD", label: "Mariscos" },
  { value: "PEANUT", label: "Cacahuate" },
  { value: "LACTOSE", label: "Lactosa" },
  { value: "NUT", label: "Nueces" },
  { value: "GLUTEN", label: "Gluten" },
  { value: "FISH", label: "Pescado" },
  { value: "VEGETARIAN", label: "Vegetariano" },
  { value: "SPICY", label: "Picante" }
] as const
