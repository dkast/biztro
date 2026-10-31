import { z } from "zod/v4"

export const orderLabelMaxLength = 40
export const orderNotesMaxLength = 300

export const orderContextSchema = z.object({
  label: z
    .string()
    .trim()
    .max(orderLabelMaxLength, "Usa máximo 40 caracteres")
    .optional(),
  notes: z
    .string()
    .trim()
    .max(orderNotesMaxLength, "Usa máximo 300 caracteres")
    .optional()
})

export const orderRequestIdSchema = z.string().trim().min(8).max(64)
