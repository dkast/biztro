import { gateway, generateText, Output, type GeneratedFile } from "ai"
import { MockLanguageModelV3 } from "ai/test"

import {
  menuImportOutputSchema,
  menuImportVisualPackageSchema,
  type MenuImportFileInput,
  type MenuImportOutput,
  type MenuImportVisualPackage
} from "@/lib/types/menu-import"
import { env } from "@/env.mjs"

const MENU_IMPORT_ANALYSIS_MODEL = "google/gemini-2.5-flash-lite"
const MENU_IMPORT_BACKGROUND_MODEL = "google/gemini-3.1-flash-image-preview"

const mockedMenuImportResult: MenuImportOutput = {
  items: [
    {
      name: "Tacos al Pastor",
      variantName: "Regular",
      description: "Tortilla de maíz con cerdo adobado y piña",
      price: 95,
      category: "Tacos",
      currency: "MXN",
      reliabilityScore: 0.97,
      needsReview: false,
      reviewReasons: [],
      corrections: []
    },
    {
      name: "Molletes con jamón",
      variantName: "Regular",
      description: "Pan bolillo con frijoles, queso gratinado y jamón",
      price: 82,
      category: "Antojitos",
      currency: "MXN",
      reliabilityScore: 0.72,
      needsReview: true,
      reviewReasons: ["Se corrigió texto con artefactos de OCR"],
      corrections: [
        {
          field: "name",
          original: "Molletes c/ Jmón",
          corrected: "Molletes con jamón",
          reason: "Abreviatura y acento reconstruidos desde el contexto"
        }
      ]
    },
    {
      name: "Coquita 355 ml",
      variantName: "Regular",
      description: "Refresco embotellado",
      price: 38,
      category: "Bebidas",
      currency: "MXN",
      reliabilityScore: 0.68,
      needsReview: true,
      reviewReasons: ["Nombre posiblemente de marca o presentación comercial"],
      corrections: []
    }
  ]
}

const mockedMenuImportWithVariantsResult: MenuImportOutput = {
  items: [
    {
      name: "Hamburguesa Clásica",
      variantName: "Sencilla",
      description: "Carne de res, lechuga, jitomate y aderezo especial",
      price: 119,
      category: "Hamburguesas",
      currency: "MXN",
      reliabilityScore: 0.94,
      needsReview: false,
      reviewReasons: [],
      corrections: []
    },
    {
      name: "Hamburguesa Clásica",
      variantName: "Doble",
      description: "Carne de res, lechuga, jitomate y aderezo especial",
      price: 149,
      category: "Hamburguesas",
      currency: "MXN",
      reliabilityScore: 0.92,
      needsReview: false,
      reviewReasons: [],
      corrections: []
    },
    {
      name: "Limonada",
      variantName: "Chica",
      description: "Bebida fresca de limón natural",
      price: 39,
      category: "Bebidas",
      currency: "MXN",
      reliabilityScore: 0.86,
      needsReview: false,
      reviewReasons: [],
      corrections: []
    },
    {
      name: "Limonada",
      variantName: "Grande",
      description: "Bebida fresca de limón natural",
      price: 59,
      category: "Bebidas",
      currency: "MXN",
      reliabilityScore: 0.63,
      needsReview: true,
      reviewReasons: ["Precio inferido desde una lista de variantes cercana"],
      corrections: []
    }
  ]
}

const mockedVisualPackage: MenuImportVisualPackage = {
  menuName: "Menú importado",
  styleSummary:
    "Diseño casual con contraste alto, acentos cálidos, textura de papel y motivos gráficos adaptables a móvil.",
  motifs: [
    "patrón sutil de papel texturizado",
    "ilustraciones de comida",
    "encabezado cálido",
    "pie decorativo",
    "separadores orgánicos"
  ],
  colorTheme: {
    name: "Importado cálido",
    surfaceColor: "#1F130D",
    brandColor: "#F97316",
    accentColor: "#FACC15",
    textColor: "#FFF7ED",
    mutedColor: "#FDBA74"
  },
  backgroundPrompt:
    "Create a mobile-first 9:16 restaurant menu background inspired by a warm Mexican printed menu: subtle paper texture, soft illustrated food motifs, reusable header and footer treatments, delicate section-divider shapes, orange and amber accents, a calm central reading area, premium but casual style, no text, no logos, no prices."
}

function createMockMenuImportModel(
  scenario: MenuImportFileInput["simulateScenario"]
) {
  return new MockLanguageModelV3({
    doGenerate: () =>
      Promise.resolve({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              scenario === "variants"
                ? mockedMenuImportWithVariantsResult
                : mockedMenuImportResult
            )
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
            total: 80,
            text: 80,
            reasoning: undefined
          }
        },
        warnings: []
      })
  })
}

function createMockVisualModel() {
  return new MockLanguageModelV3({
    doGenerate: () =>
      Promise.resolve({
        content: [{ type: "text", text: JSON.stringify(mockedVisualPackage) }],
        finishReason: { unified: "stop", raw: undefined },
        usage: {
          inputTokens: {
            total: 10,
            noCache: 10,
            cacheRead: undefined,
            cacheWrite: undefined
          },
          outputTokens: {
            total: 80,
            text: 80,
            reasoning: undefined
          }
        },
        warnings: []
      })
  })
}

function createMockGeneratedImage(): GeneratedFile {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1F130D"/>
        <stop offset="55%" stop-color="#3B2114"/>
        <stop offset="100%" stop-color="#7C2D12"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="16%" r="60%">
        <stop offset="0%" stop-color="#FACC15" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#FACC15" stop-opacity="0"/>
      </radialGradient>
      <pattern id="dots" width="96" height="96" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="12" r="3" fill="#FDBA74" opacity=".28"/>
        <circle cx="64" cy="52" r="2" fill="#FFF7ED" opacity=".16"/>
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="url(#bg)"/>
    <rect width="1080" height="1920" fill="url(#glow)"/>
    <rect width="1080" height="1920" fill="url(#dots)"/>
    <path d="M0 260c135-88 220-70 324-20 120 58 244 60 388 4 130-50 242-32 368 40v-284h-1080z" fill="#F97316" opacity=".25"/>
    <path d="M0 1704c144-92 268-86 388-20 142 78 274 66 408 8 114-50 196-40 284 26v202h-1080z" fill="#FACC15" opacity=".22"/>
  </svg>`
  const uint8Array = new TextEncoder().encode(svg)

  return {
    mediaType: "image/svg+xml",
    uint8Array,
    base64: Buffer.from(uint8Array).toString("base64")
  }
}

function getFileOrImageContent({
  fileBase64,
  mimeType
}: Pick<MenuImportFileInput, "fileBase64" | "mimeType">) {
  return mimeType === "application/pdf"
    ? {
        type: "file" as const,
        data: fileBase64,
        mediaType: mimeType
      }
    : {
        type: "image" as const,
        image: `data:${mimeType};base64,${fileBase64}`
      }
}

export async function extractMenuItemsFromFile(input: MenuImportFileInput) {
  if (input.simulateResponse) {
    const result = await generateText({
      model: createMockMenuImportModel(input.simulateScenario),
      output: Output.object({ schema: menuImportOutputSchema }),
      prompt: "Extract menu items from this menu file"
    })

    return result.output.items
  }

  if (!env.AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY is required for menu import")
  }

  const result = await generateText({
    model: gateway(MENU_IMPORT_ANALYSIS_MODEL),
    output: Output.object({ schema: menuImportOutputSchema }),
    messages: [
      {
        role: "user",
        content: [
          getFileOrImageContent(input),
          {
            type: "text",
            text: `Extract all menu items from this menu file (PDF or image). Return Spanish-facing fields when the source language is Spanish. For each row, extract:
- name: the item name
- variantName: if the item has sizes/presentations, include the variant label (e.g., Chico/Mediano/Grande). If not present, use "Regular"
- description: a brief description if available
- price: the numeric price (just the number, no currency symbols)
- category: the section or category the item belongs to (e.g., "Entradas", "Platos Principales", "Bebidas")
- currency: if the currency is clearly stated use "MXN" or "USD", otherwise default to "MXN"
- reliabilityScore: a heuristic confidence score from 0 to 1
- needsReview: true when a human should verify the row
- reviewReasons: short Spanish reasons if needsReview is true
- corrections: OCR corrections you applied, including the original OCR text and corrected value

Important extraction and correction rules:
1) Fix only obvious OCR side effects: broken accents, 0/O or 1/l swaps, merged words, duplicated letters, missing common prepositions, or fragmented words.
2) Do not genericize branded/proprietary item names. Preserve brand-like names (e.g., "Coquita", "Big Jack", "McFlurry") and flag them for review instead of rewriting them.
3) If a section is add-ons/toppings (e.g., "Extras") and lists names under a shared section price, create one row per listed add-on using that shared price and flag as inferred when uncertain.
4) If a section lists item names with one shared price in an icon/circle/badge, apply that shared price to each item and flag low confidence when visual linkage is ambiguous.
5) If a price is not clearly tied to an item, infer only from nearest visual grouping/section header and mark needsReview.
6) Keep reliabilityScore below 0.75 when any brand/proprietary name, OCR correction, inferred price, uncertain category, or ambiguous variant is present.

Return all items you find in the menu. If an item has multiple variants, return multiple rows with the same name and different variantName/price.`
          }
        ]
      }
    ]
  })

  return result.output.items
}

export async function analyzeMenuVisualPackage(input: MenuImportFileInput) {
  if (input.simulateResponse) {
    const result = await generateText({
      model: createMockVisualModel(),
      output: Output.object({ schema: menuImportVisualPackageSchema }),
      prompt: "Analyze this menu visual style"
    })

    return result.output
  }

  if (!env.AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY is required for visual menu import")
  }

  const result = await generateText({
    model: gateway(MENU_IMPORT_ANALYSIS_MODEL),
    output: Output.object({ schema: menuImportVisualPackageSchema }),
    messages: [
      {
        role: "user",
        content: [
          getFileOrImageContent(input),
          {
            type: "text",
            text: `Analyze this imported printed menu as a visual reference for a mobile-first digital menu. Return:
- menuName: a concise Spanish name for the generated draft menu
- styleSummary: Spanish summary of the visual direction
- motifs: reusable graphics, typography mood, textures, ingredient cues, shapes, section dividers, header/footer ideas, or patterns from the menu
- colorTheme: a contrast-safe #RRGGBB palette for a digital menu with surfaceColor, brandColor, accentColor, textColor, mutedColor
- backgroundPrompt: an English image-generation prompt for a 9:16 mobile background inspired by the source menu

The background must keep overlaid menu text fully legible while still feeling designed and colorful. Use the palette's surface color as a clean base, but add a confident decorative accent zone using the brand and accent colors. Concentrate the motifs and graphics in one focused area — the top band, the bottom band, or a single corner — so the rest of the canvas stays open for text. The accent zone can use solid color shapes, a color block, or grouped motifs with real saturation, not just faint outlines. Avoid a full-bleed repeating watermark pattern across the whole canvas. The decoration must work when cropped for mobile and when expanded to desktop, so anchor it to an edge or corner rather than the center. It must not include readable text, logos, menu item names, prices, QR codes, phone numbers, or exact brand marks. Keep a clean, high-contrast central reading area for the app's generated menu text.`
          }
        ]
      }
    ]
  })

  return result.output
}

export async function generateImportedMenuBackground({
  fileBase64,
  mimeType,
  visualPackage,
  simulateResponse
}: Pick<MenuImportFileInput, "fileBase64" | "mimeType" | "simulateResponse"> & {
  visualPackage: MenuImportVisualPackage
}) {
  if (simulateResponse) return createMockGeneratedImage()

  if (!env.AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY is required for visual menu import")
  }

  const sourceReferenceInstruction =
    mimeType === "application/pdf"
      ? "Use the provided visual analysis as the design reference. Do not invent readable menu text."
      : "Use the attached menu image as a visual reference. Extract and adapt its colors, motifs, texture, layout rhythm, and decorative assets without copying readable text or exact logos."

  const promptText = `${visualPackage.backgroundPrompt}

Style notes: ${visualPackage.styleSummary}
Motifs to feature in the accent zone: ${visualPackage.motifs.join(", ")}
Palette: surface ${visualPackage.colorTheme.surfaceColor}, brand ${visualPackage.colorTheme.brandColor}, accent ${visualPackage.colorTheme.accentColor}, text-safe contrast around ${visualPackage.colorTheme.textColor}.
Source reference: ${sourceReferenceInstruction}

Create one premium, colorful vertical restaurant menu background optimized for a 9:16 mobile canvas. Use the surface color as a clean base for most of the canvas, but include one confident decorative accent zone that actually uses the brand and accent colors with real saturation — a color block, solid shapes, or a tight group of the menu's motifs. Anchor that accent zone to a single area: the top band, the bottom band, or one corner, so it works both when cropped on mobile and when expanded on desktop. Do not spread a faint repeating watermark pattern across the entire canvas, and do not leave it nearly colorless. Keep the large central area open and high-contrast so dark menu text stays fully readable over it. No readable text, no logos, no prices, no QR codes, no phone numbers, no exact brand marks.`

  const result = await generateText({
    model: gateway(MENU_IMPORT_BACKGROUND_MODEL),
    messages: [
      {
        role: "user",
        content:
          mimeType === "application/pdf"
            ? [{ type: "text", text: promptText }]
            : [
                getFileOrImageContent({ fileBase64, mimeType }),
                { type: "text", text: promptText }
              ]
      }
    ],
    maxRetries: 1
  })
  const image = result.files.find(file => file.mediaType.startsWith("image/"))

  if (!image) {
    throw new Error("Nano Banana did not return an image file")
  }

  return image
}
