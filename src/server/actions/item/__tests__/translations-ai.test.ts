import { generateText, Output } from "ai"
import type * as Ai from "ai"
import { MockLanguageModelV4 } from "ai/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { translateMenuItems } from "@/server/actions/item/translations"
import {
  itemTranslationOutputSchema,
  translationOutputSchema
} from "@/lib/types/translation-ai"

const mocks = vi.hoisted(() => ({
  gateway: vi.fn(),
  updateTag: vi.fn(),
  captureMessage: vi.fn(),
  menuItem: { findMany: vi.fn() },
  category: { findMany: vi.fn() },
  transaction: {
    menuItem: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
    menuItemTranslation: { upsert: vi.fn() },
    variantTranslation: { upsert: vi.fn() },
    categoryTranslation: { upsert: vi.fn() }
  }
}))

vi.mock("ai", async importOriginal => ({
  ...(await importOriginal<typeof Ai>()),
  gateway: mocks.gateway
}))
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }))
vi.mock("@sentry/nextjs", () => ({ captureMessage: mocks.captureMessage }))
vi.mock("@/env.mjs", () => ({ env: { AI_GATEWAY_API_KEY: "test-key" } }))
vi.mock("@/server/actions/user/queries", () => ({
  isProMember: async () => true
}))
vi.mock("@/lib/prisma", () => ({
  default: {
    menuItem: mocks.menuItem,
    category: mocks.category,
    $transaction: (callback: (tx: typeof mocks.transaction) => unknown) =>
      callback(mocks.transaction)
  }
}))
vi.mock("@/lib/safe-actions", async () => {
  const { createSafeActionClient } = await import("next-safe-action")
  return {
    authMemberActionClient: createSafeActionClient().use(({ next }) =>
      next({ ctx: { member: { organizationId: "org-1" } } })
    )
  }
})

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

describe("bulk menu translation persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.menuItem.findMany.mockResolvedValue([
      {
        id: "item-1",
        name: "Tacos",
        variants: [
          { id: "variant-1", name: "Regular" },
          { id: "deleted-variant", name: "Picante" }
        ]
      },
      { id: "deleted-item", name: "Enchiladas", variants: [] }
    ])
    mocks.category.findMany.mockResolvedValue([
      { id: "category-1", name: "Comida" },
      { id: "deleted-category", name: "Bebidas" }
    ])
    mocks.transaction.menuItem.findMany.mockResolvedValue([
      {
        id: "item-1",
        variants: [{ id: "variant-1" }, { id: "new-variant" }]
      }
    ])
    mocks.transaction.category.findMany.mockResolvedValue([
      { id: "category-1" }
    ])
  })

  it("saves only requested records that still belong to the menu", async () => {
    mocks.gateway.mockReturnValue(
      createStructuredOutputModel({
        items: [
          {
            menuItemId: "item-1",
            name: "Tacos",
            variants: [
              { variantId: "variant-1", name: "Regular" },
              { variantId: "deleted-variant", name: "Spicy" },
              { variantId: "new-variant", name: "New" }
            ]
          },
          { menuItemId: "unknown-item", name: "Unknown", variants: [] },
          { menuItemId: "deleted-item", name: "Enchiladas", variants: [] }
        ],
        categories: [
          { categoryId: "category-1", name: "Food" },
          { categoryId: "deleted-category", name: "Drinks" }
        ]
      })
    )

    await expect(translateMenuItems({ locale: "en" })).resolves.toEqual({
      data: { success: { locale: "en", count: 1 } }
    })
    expect(mocks.transaction.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: ["item-1", "deleted-item"] },
          organizationId: "org-1",
          status: "ACTIVE"
        }
      })
    )
    expect(mocks.transaction.menuItemTranslation.upsert.mock.calls).toEqual([
      [
        expect.objectContaining({
          create: expect.objectContaining({ menuItemId: "item-1" })
        })
      ]
    ])
    expect(mocks.transaction.variantTranslation.upsert.mock.calls).toEqual([
      [
        expect.objectContaining({
          create: expect.objectContaining({ variantId: "variant-1" })
        })
      ]
    ])
    expect(mocks.transaction.categoryTranslation.upsert.mock.calls).toEqual([
      [
        expect.objectContaining({
          create: expect.objectContaining({ categoryId: "category-1" })
        })
      ]
    ])
    expect(mocks.captureMessage).toHaveBeenCalledOnce()
    expect(mocks.updateTag).toHaveBeenCalledWith("translations-org-1")
  })

  it("returns a failure without writing when no items match", async () => {
    mocks.gateway.mockReturnValue(
      createStructuredOutputModel({
        items: [{ menuItemId: "unknown-item", name: "Unknown", variants: [] }],
        categories: [{ categoryId: "category-1", name: "Food" }]
      })
    )

    await expect(translateMenuItems({ locale: "en" })).resolves.toMatchObject({
      data: { failure: { reason: expect.any(String) } }
    })
    expect(mocks.transaction.menuItemTranslation.upsert).not.toHaveBeenCalled()
    expect(mocks.transaction.categoryTranslation.upsert).not.toHaveBeenCalled()
    expect(mocks.updateTag).not.toHaveBeenCalled()
  })
})
