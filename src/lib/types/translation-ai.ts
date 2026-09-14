import { z } from "zod/v4"

const categoryTranslationSchema = z.object({
  categoryId: z.string().describe("Original category ID"),
  name: z.string().describe("Translated category name")
})

export const translationOutputSchema = z.object({
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

export const itemTranslationOutputSchema = z.object({
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
