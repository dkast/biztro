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
  type MenuImportGeneratedColorTheme,
  type MenuImportItem,
  type MenuImportOutput,
  type MenuImportVisualPackage
} from "@/lib/types/menu-import"
import {
  colorThemes,
  fontThemes,
  imagePresets,
  themePresets,
  type ColorTheme,
  type ThemePreset
} from "@/lib/types/theme"
import { env } from "@/env.mjs"

const MENU_IMPORT_ANALYSIS_MODEL = "google/gemini-3.1-flash-lite"
const DEFAULT_FONT_THEME = "DEFAULT"
type VisualTone = "dark" | "light"

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
  presetSource: "imagePreset",
  imagePresetId: "img-mexicano",
  colorThemeId: "MOSTAZA_DARK",
  backgroundImage: "bg-center-molcajete-1.jpg",
  categoryTextTransform: "uppercase",
  itemTextTransform: "none",
  colorTheme: {
    name: "Mostaza oscuro",
    surfaceColor: "#0f0e00",
    brandColor: "#fefce8",
    accentColor: "#facc15",
    textColor: "#fefce8",
    mutedColor: "#fde047"
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

function getColorThemeById(colorThemeId: string | undefined) {
  return colorThemes.find(theme => theme.id === colorThemeId)
}

function getImagePresetById(imagePresetId: string | undefined) {
  return imagePresets.find(preset => preset.id === imagePresetId)
}

function getThemePresetById(themePresetId: string | undefined) {
  return themePresets.find(preset => preset.id === themePresetId)
}

function getImagePresetByBackgroundImage(backgroundImage: string) {
  if (backgroundImage === "none") return undefined

  return imagePresets.find(preset => preset.bgImage === backgroundImage)
}

function toGeneratedColorTheme(
  colorTheme: ColorTheme
): MenuImportGeneratedColorTheme {
  return {
    name: colorTheme.name,
    surfaceColor: colorTheme.surfaceColor,
    brandColor: colorTheme.brandColor,
    accentColor: colorTheme.accentColor,
    textColor: colorTheme.textColor,
    mutedColor: colorTheme.mutedColor
  }
}

function isValidFontTheme(fontTheme: string | undefined): fontTheme is string {
  return fontThemes.some(theme => theme.name === fontTheme)
}

function isHexColorDark(hex: string) {
  const clean = hex.replace("#", "")
  const r = Number.parseInt(clean.slice(0, 2), 16)
  const g = Number.parseInt(clean.slice(2, 4), 16)
  const b = Number.parseInt(clean.slice(4, 6), 16)

  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

function getPresetBackgroundTone(preset: ThemePreset | undefined) {
  if (!preset?.tags.includes("dark")) return undefined

  return "dark" satisfies VisualTone
}

function getColorThemeTone({
  surfaceColor,
  textColor,
  tags
}: Pick<MenuImportGeneratedColorTheme, "surfaceColor" | "textColor"> & {
  tags?: string[]
}) {
  if (tags?.includes("dark")) return "dark" satisfies VisualTone
  if (tags?.includes("light")) return "light" satisfies VisualTone

  const isSurfaceDark = isHexColorDark(surfaceColor)
  const isTextDark = isHexColorDark(textColor)

  if (isSurfaceDark === isTextDark) return undefined

  return isSurfaceDark ? "dark" : "light"
}

function matchesRequiredTone({
  colorTheme,
  requiredTone
}: {
  colorTheme:
    | ColorTheme
    | Pick<MenuImportGeneratedColorTheme, "surfaceColor" | "textColor">
  requiredTone?: VisualTone
}) {
  if (!requiredTone) return true

  return (
    getColorThemeTone({
      surfaceColor: colorTheme.surfaceColor,
      textColor: colorTheme.textColor,
      tags: "tags" in colorTheme ? colorTheme.tags : undefined
    }) === requiredTone
  )
}

function getNormalizedFontTheme({
  fontTheme,
  fallbackFontTheme
}: {
  fontTheme: string | undefined
  fallbackFontTheme?: string
}) {
  if (isValidFontTheme(fontTheme)) return fontTheme
  if (isValidFontTheme(fallbackFontTheme)) return fallbackFontTheme

  return DEFAULT_FONT_THEME
}

function getNormalizedColorTheme({
  colorTheme,
  colorThemeId,
  requiredTone,
  fallbackColorThemeId
}: {
  colorTheme: MenuImportGeneratedColorTheme
  colorThemeId?: string
  requiredTone?: VisualTone
  fallbackColorThemeId?: string
}) {
  const matchingColorTheme = getColorThemeById(colorThemeId)

  if (
    matchingColorTheme &&
    matchesRequiredTone({ colorTheme: matchingColorTheme, requiredTone })
  ) {
    return {
      colorTheme: toGeneratedColorTheme(matchingColorTheme),
      colorThemeId: matchingColorTheme.id
    }
  }

  if (matchesRequiredTone({ colorTheme, requiredTone })) {
    return {
      colorTheme,
      colorThemeId: undefined
    }
  }

  const fallbackColorTheme = getColorThemeById(fallbackColorThemeId)

  if (
    fallbackColorTheme &&
    matchesRequiredTone({ colorTheme: fallbackColorTheme, requiredTone })
  ) {
    return {
      colorTheme: toGeneratedColorTheme(fallbackColorTheme),
      colorThemeId: fallbackColorTheme.id
    }
  }

  return {
    colorTheme,
    colorThemeId: undefined
  }
}

function applyPresetToVisualPackage({
  visualPackage,
  preset,
  backgroundImage
}: {
  visualPackage: MenuImportVisualPackage
  preset: ThemePreset
  backgroundImage: MenuImportVisualPackage["backgroundImage"]
}) {
  return {
    ...visualPackage,
    fontTheme: getNormalizedFontTheme({
      fontTheme: visualPackage.fontTheme,
      fallbackFontTheme: preset.fontTheme
    }),
    backgroundImage
  }
}

function normalizeVisualPackage(
  visualPackage: MenuImportVisualPackage
): MenuImportVisualPackage {
  const selectedImagePreset =
    getImagePresetById(visualPackage.imagePresetId) ??
    getImagePresetByBackgroundImage(visualPackage.backgroundImage)

  if (selectedImagePreset?.bgImage) {
    const normalizedColorTheme = getNormalizedColorTheme({
      colorTheme: visualPackage.colorTheme,
      colorThemeId: visualPackage.colorThemeId,
      requiredTone: getPresetBackgroundTone(selectedImagePreset),
      fallbackColorThemeId: selectedImagePreset.colorTheme
    })

    return {
      ...applyPresetToVisualPackage({
        visualPackage,
        preset: selectedImagePreset,
        backgroundImage: selectedImagePreset.bgImage
      }),
      ...normalizedColorTheme,
      presetSource: "imagePreset",
      imagePresetId: selectedImagePreset.id,
      themePresetId: undefined
    }
  }

  const selectedThemePreset = getThemePresetById(visualPackage.themePresetId)

  if (selectedThemePreset) {
    const normalizedColorTheme = getNormalizedColorTheme({
      colorTheme: visualPackage.colorTheme,
      colorThemeId: visualPackage.colorThemeId,
      fallbackColorThemeId: selectedThemePreset.colorTheme
    })

    return {
      ...applyPresetToVisualPackage({
        visualPackage,
        preset: selectedThemePreset,
        backgroundImage: "none"
      }),
      ...normalizedColorTheme,
      presetSource: "themePreset",
      imagePresetId: undefined,
      themePresetId: selectedThemePreset.id
    }
  }

  const normalizedColorTheme = getNormalizedColorTheme({
    colorTheme: visualPackage.colorTheme,
    colorThemeId: visualPackage.colorThemeId
  })

  return {
    ...visualPackage,
    ...normalizedColorTheme,
    presetSource: "custom",
    fontTheme: getNormalizedFontTheme({ fontTheme: visualPackage.fontTheme })
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

    return normalizeVisualPackage(result.output)
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
- fontTheme: one existing font theme name chosen exactly from fontThemes[*].name by matching the source menu typography as closely as possible
- presetSource: "imagePreset" when an image preset reasonably fits, "themePreset" when only a non-image preset fits, or "custom" only when no preset fits
- imagePresetId: exact imagePresets[*].id when presetSource is "imagePreset"
- themePresetId: exact themePresets[*].id when presetSource is "themePreset"
- colorThemeId: exact colorThemes[*].id when an existing color theme is close to the colors seen in the source menu and still satisfies the selected image preset readability constraints; omit only when no existing theme fits and you create a custom palette
- backgroundImage: imagePresets[*].bgImage when presetSource is "imagePreset"; otherwise "none"
- categoryTextTransform: "uppercase" only when category headings should visually render in all caps; otherwise "none"
- itemTextTransform: "uppercase" only when item names should visually render in all caps; otherwise "none"
- colorTheme: if colorThemeId is set, return that exact built-in colorThemes palette; otherwise return a custom contrast-safe #RRGGBB palette that closely matches the menu colors. accentColor must stay distinct from every headingBackgroundColor you generate
- layoutGuidance: Spanish guidance for applying the style with editable editor properties, not generated images
- categoryDesigns: category-specific design patterns that can be applied to category blocks. Each pattern should include categoryName plus any useful editable values: headingBackgroundColor, headingTextColor, headingShape, categoryTextTransform, itemTextColor, itemTextTransform, priceTextColor, descriptionTextColor, and designNotes.

Catalog guidance:
${visualCatalog}

Selection rules:
1) Evaluate imagePresets first. The goal is a visually appealing menu, so choose an image preset whenever cuisine, food type, ingredients, mood, colors, or layout direction are a reasonable match. Do not require an exact source photo match.
2) Avoid imagePresets only when every available image would misrepresent the restaurant, clash strongly with the source brand, or make mobile text legibility worse.
3) If using an image preset, return presetSource "imagePreset", its exact imagePresetId, and its exact bgImage as backgroundImage. Do not let the preset choose the palette automatically.
4) Select colorThemeId independently from preset selection by matching the colors seen on the source menu to colorThemes. Focus on the overall palette, not just one accent color.
5) When the selected image preset tags include "dark", the resulting color theme must also be dark: dark surfaceColor, light textColor, and strong foreground readability over the photo background.
6) For dark-tag image presets, never return a light theme or any palette with dark text on a light surface, even if those colors appear in the source menu. Preserve the brand colors through accents and details while keeping the main reading surface dark.
7) If a built-in color theme is close enough and compatible with the selected image preset tone, return its exact colorThemeId and that exact built-in palette in colorTheme, even if it differs from the preset's own referenced colorTheme.
8) If no built-in color theme is close enough while also satisfying the selected image preset tone, omit colorThemeId and create a custom palette that preserves the source menu colors but keeps the required readable tone.
9) Only if no image preset reasonably fits, evaluate themePresets and choose the closest non-image visual direction. Return presetSource "themePreset", exact themePresetId, and backgroundImage "none".
10) Choose presetSource "custom" only when neither imagePresets nor themePresets fit. Custom colors are allowed independently of presetSource when no built-in color theme matches.
11) Select fontTheme independently from preset selection by comparing the uploaded menu typography to fontThemes: serif, sans, condensed, handwritten/script, playful display, rustic, elegant, modern, bold, etc. The result should still feel like the customer's brand, not like an unrelated redesign.
12) Use a preset's fontTheme only when it is also the closest typographic match to the source menu. If another fontThemes[*].name better resembles the source typography, return that fontTheme even when using an imagePreset or themePreset.
13) Keep all user-facing text fields in Spanish. Exact catalog values such as fontTheme, imagePresetId, themePresetId, colorThemeId, and backgroundImage must stay as their original IDs.
14) The extracted menu data is normalized, so if the source menu uses all-caps as a visual treatment, preserve that look by setting categoryTextTransform and/or itemTextTransform to "uppercase" instead of relying on uppercase data.

Do not create an image prompt. The draft menu will be built from editable colors, an optional catalog background image, heading treatments, and typography mood. Do not use full category section background colors. Extract category-level design ideas from the source menu when visible, and also use the category semantics when helpful: for example, beverages can use a cooler title treatment, desserts can use a softer accent, and principal categories can use stronger title treatments.

Legibility rules (strict):
1) Never choose the same color for headingBackgroundColor and headingTextColor.
2) Never choose near-identical colors for headingBackgroundColor and headingTextColor (including same hue with only tiny brightness change).
3) When headingBackgroundColor is provided, headingTextColor must also be provided.
4) Ensure strong text contrast for headings: target WCAG AA equivalent contrast (at least 4.5:1) and prefer higher contrast for small text.
5) If a sampled source color causes low contrast, adjust lightness/saturation to preserve style while keeping readability.
6) Never use the same hex value for colorTheme.accentColor and any categoryDesigns.headingBackgroundColor.
7) Avoid near-identical accentColor and headingBackgroundColor values; they must be visually distinct enough that accent elements and heading ribbons/chips do not clash.
8) If the chosen image preset has a "dark" tag, the menu must render as light text on a dark reading surface. Do not return a light surface with dark text in that case.

Keep every returned color contrast-safe for readable mobile menu text. Use only #RRGGBB colors. Use Spanish category names that match or closely correspond to the extracted menu sections.`
          }
        ]
      }
    ]
  })

  return normalizeVisualPackage(result.output)
}
