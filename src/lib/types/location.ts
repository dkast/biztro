import { z } from "zod/v4"

export const locationSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Nombre es requerido" : undefined
    })
    .min(3, {
      error: "Nombre muy corto"
    })
    .max(100),
  description: z.string().optional(),
  address: z
    .string({
      error: issue =>
        issue.input === undefined ? "Dirección es requerida" : undefined
    })
    .min(3, {
      error: "Dirección no es válida"
    }),
  phone: z
    .string()
    .regex(/^\d{10}$/, {
      error: "Número de teléfono inválido"
    })
    .optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.url().optional(),
  organizationId: z.string().optional(),
  serviceDelivery: z.boolean().default(false).optional(),
  serviceTakeout: z.boolean().default(false).optional(),
  serviceDineIn: z.boolean().default(false).optional(),
  deliveryFee: z.number().min(0).default(0).optional(),
  currency: z.enum(["MXN", "USD"]).default("MXN").optional()
})

export const hoursSchema = z.object({
  locationId: z.string().optional(),
  items: z.array(
    z
      .object({
        id: z.string().optional(),
        day: z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY"
        ]),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        allDay: z.boolean()
      })
      .refine(
        data => {
          if (data.allDay) {
            return data.startTime && data.endTime
          } else {
            return true
          }
        },
        {
          path: ["allDay"],
          error: "Ingresa la hora"
        }
      )
  )
})
