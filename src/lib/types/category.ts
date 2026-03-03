import { z } from "zod/v4"

export const categorySchema = z.object({
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
  organizationId: z.string().optional(),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

export const enum ActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}
