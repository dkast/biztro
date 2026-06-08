import { gateway, generateText, Output } from "ai"
import { MockLanguageModelV3 } from "ai/test"

import { getMenuImportVisualCatalogPrompt } from "@/server/actions/menu-import/visual-catalog"
import {
  normalizeMenuDescriptionText,
  normalizeMenuLabelCasing
} from "@/lib/menu-text"
import {
  menuImportOutputSchema,
  menuImportVisualPackageSchema,
  type MenuImportFileInput,
  type MenuImportItem,
  type MenuImportOutput,
  type MenuImportVisualPackage
} from "@/lib/types/menu-import"
import { env } from "@/env.mjs"

const MENU_IMPORT_ANALYSIS_MODEL = "google/gemini-2.5-flash-lite"

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
  fontTheme: "OAXACA",
  backgroundImage: "bg-center-molcajete-1.jpg",
  categoryTextTransform: "uppercase",
  itemTextTransform: "none",
  colorTheme: {
    name: "Importado cálido",
    surfaceColor: "#1F130D",
    brandColor: "#F97316",
    accentColor: "#FACC15",
    textColor: "#FFF7ED",
    mutedColor: "#FDBA74"
  },
  layoutGuidance:
    "Usa una base oscura y cálida, títulos con acentos naranja/ámbar y jerarquía clara por categoría sin fondos de bloque.",
  categoryDesigns: [
    {
      categoryName: "Tacos",
      headingBackgroundColor: "#F97316",
      headingTextColor: "#FFF7ED",
      headingShape: "ribbon",
      designNotes: "Sección principal con tratamiento cálido y enérgico."
    },
    {
      categoryName: "Antojitos",
      headingBackgroundColor: "#FACC15",
      headingTextColor: "#1F130D",
      headingShape: "rounded",
      designNotes:
        "Bloque secundario con acento amarillo inspirado en papel impreso."
    },
    {
      categoryName: "Bebidas",
      headingBackgroundColor: "#FDBA74",
      headingTextColor: "#1F130D",
      headingShape: "pill",
      designNotes: "Diferencia bebidas con un fondo más fresco y contrastado."
    }
  ]
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

function normalizeExtractedMenuItem(item: MenuImportItem): MenuImportItem {
  return {
    ...item,
    name: normalizeMenuLabelCasing(item.name),
    variantName: item.variantName
      ? normalizeMenuLabelCasing(item.variantName)
      : item.variantName,
    description: item.description
      ? normalizeMenuDescriptionText(item.description)
      : item.description,
    category: item.category
      ? normalizeMenuLabelCasing(item.category)
      : item.category
  }
}

export async function extractMenuItemsFromFile(input: MenuImportFileInput) {
  if (input.simulateResponse) {
    const result = await generateText({
      model: createMockMenuImportModel(input.simulateScenario),
      output: Output.object({ schema: menuImportOutputSchema }),
      prompt: "Extract menu items from this menu file"
    })

    return result.output.items.map(normalizeExtractedMenuItem)
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
- description: the item-specific description when visible; include smaller secondary text, ingredient blurbs, or explanatory copy that belongs to the item
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

Description rules:
1) Descriptions are often smaller, lighter, italic, or multi-line text directly below or beside the item name. Inspect each item block for that secondary text before leaving description empty.
2) If one description clearly applies to all variants/sizes of the same item, repeat that same description on every returned row for the item.
3) Join wrapped description lines into a single natural sentence and keep meaningful ingredient/preparation details from the source.
4) Only leave description empty when no item-specific descriptive copy is visible or confidently linked to the item.
5) Do not invent descriptions. If text is partially legible, reconstruct only obvious OCR damage and record the correction when material.

Casing normalization rules:
1) Return item names, variant names, and category names in natural Spanish casing, not in all caps used only as visual styling.
2) Prefer consistent menu-style title casing with short Spanish articles/prepositions lowercased when appropriate, e.g. "Tacos al Pastor", "Agua de Jamaica", "Platos Fuertes".
3) Preserve intentional brand casing, acronyms, and proper nouns exactly when known or strongly implied, e.g. "BBQ", "IPA", "Big Jack", "McFlurry".
4) Never return a whole item/category/variant name in uppercase just because the source menu printed it that way. Uppercase styling is handled later by editable menu design settings.
5) Do not add casing-only changes to corrections; use needsReview/reviewReasons only when casing is ambiguous because of a brand, acronym, or OCR uncertainty.

Return all items you find in the menu. If an item has multiple variants, return multiple rows with the same name and different variantName/price.`
          }
        ]
      }
    ]
  })

  return result.output.items.map(normalizeExtractedMenuItem)
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

  const visualCatalog = getMenuImportVisualCatalogPrompt()
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
            text: `Analyze this imported printed menu as a visual reference for a mobile-first editable digital menu draft. Return:
- menuName: a concise Spanish name for the generated draft menu
- styleSummary: Spanish summary of the visual direction
- motifs: reusable graphics, typography mood, textures, ingredient cues, shapes, section dividers, header/footer ideas, or patterns from the menu
- fontTheme: one existing font theme name chosen exactly from the provided catalog
- backgroundImage: one exact background image from the provided catalog, or "none" if no catalog image should be used
- categoryTextTransform: "uppercase" only when category headings should visually render in all caps; otherwise "none"
- itemTextTransform: "uppercase" only when item names should visually render in all caps; otherwise "none"
- colorTheme: a contrast-safe #RRGGBB palette for a digital menu with surfaceColor, brandColor, accentColor, textColor, mutedColor. accentColor must stay distinct from every headingBackgroundColor you generate
- layoutGuidance: Spanish guidance for applying the style with editable editor properties, not generated images
- categoryDesigns: category-specific design patterns that can be applied to category blocks. Each pattern should include categoryName plus any useful editable values: headingBackgroundColor, headingTextColor, headingShape, categoryTextTransform, itemTextColor, itemTextTransform, priceTextColor, descriptionTextColor, and designNotes.

Catalog guidance:
${visualCatalog}

Selection rules:
1) Review themePresets first and pick the closest currently available theme direction when one fits the brand/menu. Use that themePreset to guide fontTheme, color mood, and overall styling direction.
2) Choose fontTheme exactly from themePresets[*].fontTheme or fontThemes[*].name.
3) Always generate a custom colorTheme that feels unique to the brand/source menu. Never copy a built-in color theme exactly, but you may adapt the selected themePreset's direction.
4) If a catalog image background strongly fits the imported brand/menu, return its exact bgImage as backgroundImage. Otherwise return "none". Never invent a new asset, filename, or URL.
5) Keep all user-facing text fields in Spanish. Only exact catalog values such as fontTheme/backgroundImage should stay as their original IDs.
6) The extracted menu data is normalized, so if the source menu uses all-caps as a visual treatment, preserve that look by setting categoryTextTransform and/or itemTextTransform to "uppercase" instead of relying on uppercase data.

Do not create an image prompt. The draft menu will be built from editable colors, an optional catalog background image, heading treatments, and typography mood. Do not use full category section background colors. Extract category-level design ideas from the source menu when visible, and also use the category semantics when helpful: for example, beverages can use a cooler title treatment, desserts can use a softer accent, and principal categories can use stronger title treatments.

Legibility rules (strict):
1) Never choose the same color for headingBackgroundColor and headingTextColor.
2) Never choose near-identical colors for headingBackgroundColor and headingTextColor (including same hue with only tiny brightness change).
3) When headingBackgroundColor is provided, headingTextColor must also be provided.
4) Ensure strong text contrast for headings: target WCAG AA equivalent contrast (at least 4.5:1) and prefer higher contrast for small text.
5) If a sampled source color causes low contrast, adjust lightness/saturation to preserve style while keeping readability.
6) Never use the same hex value for colorTheme.accentColor and any categoryDesigns.headingBackgroundColor.
7) Avoid near-identical accentColor and headingBackgroundColor values; they must be visually distinct enough that accent elements and heading ribbons/chips do not clash.

Keep every returned color contrast-safe for readable mobile menu text. Use only #RRGGBB colors. Use Spanish category names that match or closely correspond to the extracted menu sections.`
          }
        ]
      }
    ]
  })

  return result.output
}
