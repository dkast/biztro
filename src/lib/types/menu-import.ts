import { z } from "zod/v4"

import {
  SUPPORTED_UPLOAD_MIME_TYPES,
  type SupportedUploadMimeType
} from "@/lib/types/media"

export const menuImportReviewCorrectionSchema = z.object({
  field: z
    .enum([
      "name",
      "variantName",
      "description",
      "price",
      "category",
      "currency"
    ])
    .describe("The field that was corrected"),
  original: z.string().describe("Original OCR text before correction"),
  corrected: z.string().describe("Corrected value used in the import row"),
  reason: z.string().describe("Short reason for the correction")
})

export const menuImportItemSchema = z.object({
  name: z.string().min(1).describe("Name of the menu item"),
  variantName: z
    .string()
    .optional()
    .describe("Variant or size name, e.g. Chico, Mediano, Grande"),
  description: z.string().optional().describe("Description of the menu item"),
  price: z.number().min(0).describe("Price of the menu item as a number"),
  category: z.string().optional().describe("Category the item belongs to"),
  currency: z
    .enum(["MXN", "USD"])
    .optional()
    .describe("Currency code, either MXN or USD"),
  reliabilityScore: z
    .number()
    .min(0)
    .max(1)
    .describe("Heuristic extraction reliability from 0 to 1"),
  needsReview: z
    .boolean()
    .describe("True when a human should verify the imported row"),
  reviewReasons: z
    .array(z.string())
    .describe("Short Spanish reasons explaining why review is needed"),
  corrections: z
    .array(menuImportReviewCorrectionSchema)
    .default([])
    .describe("OCR corrections applied before returning the row")
})

export const menuImportOutputSchema = z.object({
  items: z.array(menuImportItemSchema)
})

export const supportedUploadMimeTypeSchema = z.enum(SUPPORTED_UPLOAD_MIME_TYPES)

export const menuImportFileInputSchema = z.object({
  fileBase64: z
    .string()
    .min(1)
    .describe("Base64 encoded file content (PDF or image)"),
  mimeType: supportedUploadMimeTypeSchema.describe(
    "Uploaded file MIME type (PDF or image)"
  ),
  simulateResponse: z
    .boolean()
    .optional()
    .default(false)
    .describe("When true, simulates AI response using AI SDK test mocks"),
  simulateScenario: z
    .enum(["default", "variants"])
    .optional()
    .default("default")
    .describe("Mock response scenario for testing")
})

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use #RRGGBB hex color format")

export const menuImportGeneratedColorThemeSchema = z.object({
  name: z.string().min(1).max(40),
  surfaceColor: hexColorSchema,
  brandColor: hexColorSchema,
  accentColor: hexColorSchema,
  textColor: hexColorSchema,
  mutedColor: hexColorSchema
})

export const menuImportVisualPackageSchema = z.object({
  menuName: z
    .string()
    .min(1)
    .max(80)
    .describe("Concise Spanish name for the generated draft menu"),
  styleSummary: z
    .string()
    .min(1)
    .describe("Short Spanish summary of the imported menu visual style"),
  motifs: z
    .array(z.string())
    .min(1)
    .max(8)
    .describe("Visual motifs, graphics, textures, or layout cues to preserve"),
  colorTheme: menuImportGeneratedColorThemeSchema,
  backgroundPrompt: z
    .string()
    .min(40)
    .describe("Prompt for the background image generator")
})

export type MenuImportItem = z.infer<typeof menuImportItemSchema>
export type MenuImportOutput = z.infer<typeof menuImportOutputSchema>
export type MenuImportFileInput = z.infer<typeof menuImportFileInputSchema>
export type MenuImportVisualPackage = z.infer<
  typeof menuImportVisualPackageSchema
>
export type MenuImportGeneratedColorTheme = z.infer<
  typeof menuImportGeneratedColorThemeSchema
>
export type { SupportedUploadMimeType }
