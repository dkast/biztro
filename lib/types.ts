import { z } from "zod"

export enum HttpMethod {
  CONNECT = "CONNECT",
  DELETE = "DELETE",
  GET = "GET",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  PATCH = "PATCH",
  POST = "POST",
  PUT = "PUT",
  TRACE = "TRACE"
}

export enum frameSize {
  MOBILE = "MOBILE",
  DESKTOP = "DESKTOP"
}

export const FONTS = [
  "Alfa Slab One",
  "Archivo Black",
  "Arvo",
  "Bebas Neue",
  "Bitter",
  "Comfortaa",
  "Cookie",
  "Creepster",
  "Federo",
  "Fugaz One",
  "Homemade Apple",
  "Inter",
  "Merriweather",
  "Montserrat",
  "Neuton",
  "Open Sans",
  "Pacifico",
  "Parisienne",
  "Permanent Marker",
  "Playfair Display",
  "Poiriet One",
  "Raleway",
  "Roboto Slab",
  "Roboto",
  "Sacramento",
  "Send Flowers",
  "Source Sans Pro",
  "Source Serif Pro",
  "Space Grotesk",
  "Space Mono",
  "Special Elite",
  "Square Peg"
]

export const COLORS = [
  "#f6e58d",
  "#f9ca24",
  "#ffbe76",
  "#ff7979",
  "#eb4d4b",
  "#badc58",
  "#6ab04c",
  "#7ed6df",
  "#22a6b3",
  "#e056fd",
  "#be2edd",
  "#686de0",
  "#4834d4",
  "#30336b",
  "#130f40",
  "#636e72",
  "#2d3436",
  "#ffffff"
]

export const orgSchema = z.object({
  id: z.string().cuid().optional(),
  name: z
    .string({ required_error: "Nombre es requerido" })
    .min(3, { message: "Nombre muy corto" })
    .max(100, { message: "Nombre muy largo" }),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DUE"]),
  plan: z.enum(["BASIC", "PRO"]),
  subdomain: z
    .string()
    .min(3, { message: "Subdominio muy corto" })
    .trim()
    .regex(/^[a-z0-9-]+$/i, {
      message: "Solo letras, números y guiones son permitidos"
    })
})

export const locationSchema = z.object({
  id: z.string().cuid().optional(),
  name: z
    .string({
      required_error: "Nombre es requerido"
    })
    .min(3, { message: "Nombre muy corto" })
    .max(100),
  description: z.string().optional(),
  address: z
    .string({
      required_error: "Dirección es requerida"
    })
    .min(3, { message: "Dirección no es válida" }),
  phone: z
    .string()
    .regex(/^\d{10}$/, {
      message: "Número de teléfono inválido"
    })
    .optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().url().optional(),
  organizationId: z.string().cuid().optional()
})

export const variantSchema = z.object({
  id: z.string().cuid().optional(),
  name: z
    .string({
      required_error: "Nombre es requerido"
    })
    .min(3, { message: "Nombre muy corto" })
    .max(100, { message: "Nombre muy largo" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "Precio no puede ser negativo"
  }),
  menuItemId: z.string().cuid().optional()
})

export const menuItemSchema = z.object({
  id: z.string().cuid().optional(),
  name: z
    .string({
      required_error: "Nombre es requerido"
    })
    .min(3, { message: "Nombre muy corto" })
    .max(100, { message: "Nombre muy largo" }),
  description: z.string().optional(),
  image: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  organizationId: z.string().cuid().optional(),
  variants: z.array(variantSchema).nonempty()
})

export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z
    .string({
      required_error: "Nombre es requerido"
    })
    .min(3, { message: "Nombre muy corto" })
    .max(100, { message: "Nombre muy largo" }),
  organizationId: z.string().cuid().optional()
})

export const enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DUE = "DUE"
}

export const enum Plan {
  BASIC = "BASIC",
  PRO = "PRO"
}

export const enum ImageType {
  LOGO = "LOGO",
  BANNER = "BANNER",
  MENUITEM = "MENUITEM"
}

export const enum MembershipRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OWNER = "OWNER"
}

export const enum ActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}
