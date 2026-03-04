import { string, z } from "zod/v4"

export const menuSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Nombre es requerido" : undefined
    })
    .min(3, {
      error: "Nombre muy corto"
    })
    .max(100, {
      error: "Nombre muy largo"
    }),
  description: z.string().optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]),
  organizationId: z.string().optional(),
  serialData: string().optional()
})

export const enum MenuStatus {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT"
}
