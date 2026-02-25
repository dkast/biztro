"use server"

import * as Sentry from "@sentry/nextjs"
import { gateway, generateObject } from "ai"
import { z } from "zod/v4"

import { authMemberActionClient } from "@/lib/safe-actions"
import { env } from "@/env.mjs"

const pdfMenuItemSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe("Name of the menu item"),
      description: z
        .string()
        .optional()
        .describe("Description of the menu item"),
      price: z.number().describe("Price of the menu item as a number"),
      category: z
        .string()
        .optional()
        .describe("Category the item belongs to"),
      currency: z
        .enum(["MXN", "USD"])
        .optional()
        .describe("Currency code, either MXN or USD")
    })
  )
})

export type PdfMenuItem = z.infer<typeof pdfMenuItemSchema>["items"][number]

/**
 * Parses a PDF menu file and extracts structured menu items using AI.
 */
export const parsePdfMenu = authMemberActionClient
  .inputSchema(
    z.object({
      pdfBase64: z
        .string()
        .min(1)
        .describe("Base64 encoded PDF file content")
    })
  )
  .action(async ({ parsedInput: { pdfBase64 } }) => {
    if (!env.AI_GATEWAY_API_KEY) {
      return {
        failure: {
          reason:
            "La funcionalidad de importar PDF requiere configurar una clave de API del AI Gateway"
        }
      }
    }

    try {
      const result = await generateObject({
        model: gateway("mistral/mistral-small-latest"),
        schema: pdfMenuItemSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "file",
                data: pdfBase64,
                mediaType: "application/pdf"
              },
              {
                type: "text",
                text: `Extract all menu items from this PDF menu. For each item, extract:
- name: the item name
- description: a brief description if available
- price: the numeric price (just the number, no currency symbols)
- category: the section or category the item belongs to (e.g., "Entradas", "Platos Principales", "Bebidas", etc.)
- currency: if the currency is clearly stated use "MXN" or "USD", otherwise default to "MXN"

Return all items you find in the menu.`
              }
            ]
          }
        ]
      })

      return {
        success: result.object.items
      }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "pdf-import" }
      })
      return {
        failure: {
          reason:
            "No se pudo procesar el PDF. Asegúrate de que el archivo sea un menú válido."
        }
      }
    }
  })
