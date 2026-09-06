import { generateText, Output } from "ai"
import { MockLanguageModelV4 } from "ai/test"
import { describe, expect, it } from "vitest"

import {
  itemTranslationOutputSchema,
  translationOutputSchema
} from "@/lib/types/translation-ai"

function createStructuredOutputModel(output: unknown) {
  return new MockLanguageModelV4({
    doGenerate: {
      content: [{ type: "text", text: JSON.stringify(output) }],
      finishReason: { unified: "stop", raw: undefined },
      usage: {
        inputTokens: {
          total: 10,
          noCache: 10,
          cacheRead: undefined,
          cacheWrite: undefined
        },
        outputTokens: {
          total: 20,
          text: 20,
          reasoning: undefined
        }
      },
      warnings: []
    }
  })
}

describe("translation AI structured outputs", () => {
  it("parses bulk menu translations with AI SDK 7", async () => {
    const expectedOutput = {
      items: [
        {
          menuItemId: "item-1",
          name: "Pastor Tacos",
          description: "Marinated pork and pineapple",
          variants: [
            {
              variantId: "variant-1",
              name: "Regular",
              description: "Three tacos"
            }
          ]
        }
      ],
      categories: [{ categoryId: "category-1", name: "Tacos" }]
    }

    const result = await generateText({
      model: createStructuredOutputModel(expectedOutput),
      output: Output.object({ schema: translationOutputSchema }),
      prompt: "Translate this menu"
    })

    expect(result.output).toEqual(expectedOutput)
  })

  it("parses a single-item translation with AI SDK 7", async () => {
    const expectedOutput = {
      item: {
        menuItemId: "item-1",
        name: "Pastor Tacos",
        description: "Marinated pork and pineapple"
      },
      variants: [{ variantId: "variant-1", name: "Regular" }]
    }

    const result = await generateText({
      model: createStructuredOutputModel(expectedOutput),
      output: Output.object({ schema: itemTranslationOutputSchema }),
      prompt: "Translate this menu item"
    })

    expect(result.output).toEqual(expectedOutput)
  })
})
