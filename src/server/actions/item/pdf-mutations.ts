"use server"

import * as Sentry from "@sentry/nextjs"
import { gateway, generateObject } from "ai"
import { MockLanguageModelV3 } from "ai/test"
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
      category: z.string().optional().describe("Category the item belongs to"),
      currency: z
        .enum(["MXN", "USD"])
        .optional()
        .describe("Currency code, either MXN or USD")
    })
  )
})

export type PdfMenuItem = z.infer<typeof pdfMenuItemSchema>["items"][number]

const mockedPdfExtractionResult = {
  items: [
    {
      name: "Tacos al Pastor",
      description: "Tortilla de maíz con cerdo adobado y piña",
      price: 95,
      category: "Tacos",
      currency: "MXN" as const
    },
    {
      name: "Quesadilla de Champiñones",
      description: "Queso Oaxaca, champiñones salteados y salsa verde",
      price: 88,
      category: "Antojitos",
      currency: "MXN" as const
    },
    {
      name: "Limonada",
      description: "Bebida fresca de limón natural",
      price: 45,
      category: "Bebidas",
      currency: "MXN" as const
    }
  ]
}

const createMockPdfModel = () =>
  new MockLanguageModelV3({
    doGenerate: async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockedPdfExtractionResult)
        }
      ],
      finishReason: { unified: "stop", raw: undefined },
      usage: {
        inputTokens: {
          total: 10,
          noCache: 10,
          cacheRead: undefined,
          cacheWrite: undefined
        },
        outputTokens: {
          total: 40,
          text: 40,
          reasoning: undefined
        }
      },
      warnings: []
    })
  })

/**
 * Parses a PDF menu file and extracts structured menu items using AI.
 */
export const parsePdfMenu = authMemberActionClient
  .inputSchema(
    z.object({
      pdfBase64: z.string().min(1).describe("Base64 encoded PDF file content"),
      simulateResponse: z
        .boolean()
        .optional()
        .default(false)
        .describe("When true, simulates AI response using AI SDK test mocks")
    })
  )
  .action(async ({ parsedInput: { pdfBase64, simulateResponse } }) => {
    if (simulateResponse) {
      try {
        const result = await generateObject({
          model: createMockPdfModel(),
          schema: pdfMenuItemSchema,
          prompt: "Extract menu items from this menu PDF"
        })

        return {
          success: result.object.items
        }
      } catch (error) {
        console.error(error)
        Sentry.captureException(error, {
          tags: { section: "pdf-import-mock" }
        })

        return {
          failure: {
            reason:
              "No se pudo simular la extracción del PDF. Intenta nuevamente."
          }
        }
      }
    }

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
