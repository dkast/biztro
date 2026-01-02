import { string, z } from "zod/v4"

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

export enum FrameSize {
  MOBILE = "MOBILE",
  DESKTOP = "DESKTOP"
}

export enum BasicPlanLimits {
  ITEM_LIMIT_REACHED = "ITEM_LIMIT_REACHED",
  MENU_LIMIT_REACHED = "MENU_LIMIT_REACHED"
}

export const BgImages = [
  {
    image: "bg-top-burger-1.jpg",
    name: "Burger"
  },
  {
    image: "bg-center-cafe-1.jpg",
    name: "Café"
  },
  {
    image: "bg-center-cafe-2.jpg",
    name: "Café 2"
  },
  {
    image: "bg-top-tomates-1.jpg",
    name: "Fresco"
  },
  {
    image: "bg-top-salad-1.jpg",
    name: "Fresco 2"
  },
  {
    image: "bg-top-fusion-1.jpg",
    name: "Fusión"
  },
  {
    image: "bg-top-fusion-2.jpg",
    name: "Fusión 2"
  },
  {
    image: "bg-top-ice-cream-1.jpg",
    name: "Helados"
  },
  {
    image: "bg-top-ice-cream-2.jpg",
    name: "Helados 2"
  },
  {
    image: "bg-center-ice-cream-3.jpg",
    name: "Yogurt"
  },
  {
    image: "bg-center-pizza-1.jpg",
    name: "Italiano"
  },
  {
    image: "bg-top-mariscos-1.jpg",
    name: "Mariscos"
  },
  {
    image: "bg-top-mariscos-2.jpg",
    name: "Mariscos 2"
  },
  {
    image: "bg-center-molcajete-1.jpg",
    name: "Mexicano"
  },
  {
    image: "bg-center-parrilla-1.jpg",
    name: "Parrilla"
  },
  {
    image: "bg-top-tacos-1.jpg",
    name: "Pastor"
  },
  {
    image: "bg-center-sushi-1.jpg",
    name: "Sushi"
  },
  {
    image: "bg-center-sushi-2.jpg",
    name: "Sushi 2"
  },
  {
    image: "bg-top-tacos-2.jpg",
    name: "Tacos"
  },
  {
    image: "bg-center-tacos-3.jpg",
    name: "Tacos 2"
  },
  {
    image: "bg-top-bakery-1.jpg",
    name: "Postre"
  },
  {
    image: "bg-top-bakery-2.jpg",
    name: "Postre 2"
  },
  {
    image: "bg-top-breakfast-1.jpg",
    name: "Pancakes"
  },
  {
    image: "bg-top-breakfast-2.jpg",
    name: "Waffles"
  }
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

export const providers = {
  google: { id: "google", name: "Google" }
}

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36]

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  INCOMPLETE = "INCOMPLETE",
  INCOMPLETE_EXPIRED = "INCOMPLETE_EXPIRED",
  PAST_DUE = "PAST_DUE",
  UNPAID = "UNPAID",
  PAUSED = "PAUSED",
  SPONSORED = "SPONSORED" // Custom, not part of Stripe
}

export const orgSchema = z.object({
  // Accept string ids from external auth provider; keep optional for creation
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
  logo: z.url().optional(),
  banner: z.url().optional(),
  status: z.enum(SubscriptionStatus),
  plan: z.enum(["BASIC", "PRO"]),
  // Deprecated: `subdomain` will be replaced by `slug` - kept for backwards compatibility
  subdomain: z
    .string()
    .min(3, {
      error: "Subdominio muy corto"
    })
    .trim()
    .regex(/^[a-z0-9-]+$/i, {
      error: "Solo letras, números y guiones son permitidos"
    })
    .optional(),
  // New preferred field replacing subdomain
  slug: z
    .string()
    .min(3, {
      error: "Subdominio muy corto"
    })
    .trim()
    .regex(/^[a-z0-9-]+$/i, {
      error: "Solo letras, números y guiones son permitidos"
    })
})

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
  // Services offered by this location
  serviceDelivery: z.boolean().default(false).optional(),
  serviceTakeout: z.boolean().default(false).optional(),
  serviceDineIn: z.boolean().default(false).optional(),
  // Delivery fee: 0 means free
  deliveryFee: z.number().min(0).default(0).optional(),
  // Default currency for the location
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

export const variantSchema = z.object({
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
  price: z.number().min(0, { error: "Precio no puede ser negativo" }),
  menuItemId: z.string().optional()
})

export const menuItemSchema = z.object({
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
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  description: z.string().optional(),
  image: z.url().optional(),
  categoryId: z.string().optional(),
  organizationId: z.string().optional(),
  featured: z.boolean().prefault(false).optional(),
  currency: z.enum(["MXN", "USD"]).default("MXN").optional(),
  variants: z.tuple([variantSchema], variantSchema),
  allergens: z.string().optional(),
  updatePublishedMenus: z.boolean().optional(),
  rememberPublishedChoice: z.boolean().optional()
})

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

export type MenuItemQueryFilter = {
  status?: string
  category?: string
  start?: string
  end?: string
  take?: number
}

/** @deprecated Use SubscriptionStatus instead */
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

export const enum MediaAssetType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT"
}

export const enum MediaAssetScope {
  MENU_ITEM_IMAGE = "MENU_ITEM_IMAGE",
  ORG_LOGO = "ORG_LOGO",
  ORG_BANNER = "ORG_BANNER",
  PROMO = "PROMO",
  OTHER = "OTHER"
}

export const enum MediaUsageEntityType {
  MENU_ITEM = "MENU_ITEM",
  ORGANIZATION = "ORGANIZATION",
  PROMO = "PROMO"
}

export const enum MembershipRole {
  ADMIN = "admin",
  MEMBER = "member",
  OWNER = "owner"
}

export const enum ActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}

export const enum MenuItemStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED"
}

export const enum MenuStatus {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT"
}

export const enum ThemeType {
  FONT = "FONT",
  COLOR = "COLOR"
}

export const enum ThemeScope {
  GLOBAL = "GLOBAL",
  USER = "USER"
}

export const enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED"
}

export const fontThemes = [
  {
    name: "DEFAULT",
    fontDisplay: "Inter",
    fontText: "Inter"
  },
  {
    name: "MONACO",
    fontDisplay: "DM Serif Display",
    fontText: "DM Sans"
  },
  {
    name: "PORTLAND",
    fontDisplay: "Quicksand",
    fontText: "Quicksand"
  },
  {
    name: "BERLIN",
    fontDisplay: "Work Sans",
    fontText: "Merriweather"
  },
  {
    name: "AMSTERDAM",
    fontDisplay: "Playfair Display",
    fontText: "Lato"
  },
  {
    name: "GAZA",
    fontDisplay: "Yeseva One",
    fontText: "Josefin Sans"
  },
  {
    name: "OSLO",
    fontDisplay: "Raleway",
    fontText: "Libre Baskerville"
  },
  {
    name: "ROMA",
    fontDisplay: "Cinzel",
    fontText: "Fauna One"
  },
  {
    name: "PARIS",
    fontDisplay: "Poiret One",
    fontText: "Montserrat"
  },
  {
    name: "KIEV",
    fontDisplay: "Montserrat",
    fontText: "Open Sans"
  },
  {
    name: "TUCSON",
    fontDisplay: "Outfit",
    fontText: "Outfit"
  },
  {
    name: "CHICAGO",
    fontDisplay: "Oswald",
    fontText: "Merriweather"
  },
  {
    name: "ORLANDO",
    fontDisplay: "Bubblegum Sans",
    fontText: "Open Sans"
  },
  {
    name: "MADRID",
    fontDisplay: "Bungee",
    fontText: "Outfit"
  },
  {
    name: "FLORENCIA",
    fontDisplay: "Caveat",
    fontText: "Lato"
  },
  {
    name: "LISBOA",
    fontDisplay: "Pacifico",
    fontText: "QuickSand"
  },
  {
    name: "MILAN",
    fontDisplay: "Orelega One",
    fontText: "Merriweather"
  },
  {
    name: "ALAMO",
    fontDisplay: "Rye",
    fontText: "Lora"
  },
  {
    name: "SACRAMENTO",
    fontDisplay: "Sacramento",
    fontText: "Playfair Display"
  },
  {
    name: "MICHIGAN",
    fontDisplay: "Arvo",
    fontText: "Montserrat"
  },
  {
    name: "GOTHAM",
    fontDisplay: "Satisfy",
    fontText: "Open Sans"
  },
  {
    name: "AUSTIN",
    fontDisplay: "Unica One",
    fontText: "Crimson Text"
  },
  {
    name: "SEATTLE",
    fontDisplay: "Mulish",
    fontText: "Space Mono"
  },
  {
    name: "OAKLAND",
    fontDisplay: "Teko",
    fontText: "Montserrat"
  }
]

export const colorThemes = [
  {
    id: "DEFAULT",
    name: "Default",
    surfaceColor: "#ffffff",
    brandColor: "#131313",
    accentColor: "#424242",
    textColor: "#131313",
    mutedColor: "#636363",
    scope: "GLOBAL"
  },
  {
    id: "TERRA_LIGHT",
    name: "Terra",
    surfaceColor: "#fff8f6",
    brandColor: "#231917",
    accentColor: "#8f4c38",
    textColor: "#231917",
    mutedColor: "#6f5600",
    scope: "GLOBAL"
  },
  {
    id: "TERRA_DARK",
    name: "Terra oscuro",
    surfaceColor: "#271d1b",
    brandColor: "#f1dfda",
    accentColor: "#ffb5a0",
    textColor: "#f1dfda",
    mutedColor: "#f5e1a7",
    scope: "GLOBAL"
  },
  {
    id: "FLORA_LIGHT",
    name: "Flora",
    surfaceColor: "#f9faef",
    brandColor: "#1a1c16",
    accentColor: "#4c662b",
    textColor: "#1a1c16",
    mutedColor: "#006c65",
    scope: "GLOBAL"
  },
  {
    id: "FLORA_DARK",
    name: "Flora oscuro",
    surfaceColor: "#1e201a",
    brandColor: "#e2e3d8",
    accentColor: "#b1d18a",
    textColor: "#e2e3d8",
    mutedColor: "#bcece7",
    scope: "GLOBAL"
  },
  {
    id: "AZURE_LIGHT",
    name: "Azure",
    surfaceColor: "#f9f9ff",
    brandColor: "#191c20",
    accentColor: "#415f91",
    textColor: "#191c20",
    mutedColor: "#6a327a",
    scope: "GLOBAL"
  },
  {
    id: "AZURE_DARK",
    name: "Azure oscuro",
    surfaceColor: "#1d2024",
    brandColor: "#dedee4",
    accentColor: "#aac7ff",
    textColor: "#dedee4",
    mutedColor: "#fad8fd",
    scope: "GLOBAL"
  },
  {
    id: "HELIOS_LIGHT",
    name: "Helios",
    surfaceColor: "#fff9ee",
    brandColor: "#1e1b13",
    accentColor: "#6d5e0f",
    textColor: "#1e1b13",
    mutedColor: "#365944",
    scope: "GLOBAL"
  },
  {
    id: "HELIOS_DARK",
    name: "Helios oscuro",
    surfaceColor: "#222017",
    brandColor: "#e8e2d4",
    accentColor: "#dbc66e",
    textColor: "#e8e2d4",
    mutedColor: "#bce3c6",
    scope: "GLOBAL"
  },
  {
    id: "FUEGO_LIGHT",
    name: "Fuego",
    surfaceColor: "#fffaf5",
    brandColor: "#1a0a00",
    accentColor: "#ff6b00",
    textColor: "#1a0a00",
    mutedColor: "#994d1a",
    scope: "GLOBAL"
  },
  {
    id: "FUEGO_DARK",
    name: "Fuego oscuro",
    surfaceColor: "#0d0906",
    brandColor: "#fff5eb",
    accentColor: "#ff8c00",
    textColor: "#fff5eb",
    mutedColor: "#ffb366",
    scope: "GLOBAL"
  },
  {
    id: "CARMESI_LIGHT",
    name: "Carmesi",
    surfaceColor: "#fff5f5",
    brandColor: "#2d0a0a",
    accentColor: "#dc2626",
    textColor: "#2d0a0a",
    mutedColor: "#991b1b",
    scope: "GLOBAL"
  },
  {
    id: "CARMESI_DARK",
    name: "Carmesi oscuro",
    surfaceColor: "#1a0505",
    brandColor: "#fef2f2",
    accentColor: "#ef4444",
    textColor: "#fef2f2",
    mutedColor: "#fca5a5",
    scope: "GLOBAL"
  },
  {
    id: "OCEANO_LIGHT",
    name: "Oceano",
    surfaceColor: "#f0fdfa",
    brandColor: "#042f2e",
    accentColor: "#0d9488",
    textColor: "#042f2e",
    mutedColor: "#115e59",
    scope: "GLOBAL"
  },
  {
    id: "OCEANO_DARK",
    name: "Oceano oscuro",
    surfaceColor: "#021716",
    brandColor: "#f0fdfa",
    accentColor: "#2dd4bf",
    textColor: "#f0fdfa",
    mutedColor: "#5eead4",
    scope: "GLOBAL"
  },
  {
    id: "NEON_LIGHT",
    name: "Neon",
    surfaceColor: "#fafafa",
    brandColor: "#0a0a0a",
    accentColor: "#a855f7",
    textColor: "#0a0a0a",
    mutedColor: "#7c3aed",
    scope: "GLOBAL"
  },
  {
    id: "NEON_DARK",
    name: "Neon oscuro",
    surfaceColor: "#09090b",
    brandColor: "#fafafa",
    accentColor: "#c084fc",
    textColor: "#fafafa",
    mutedColor: "#e879f9",
    scope: "GLOBAL"
  },
  {
    id: "ESMERALDA_LIGHT",
    name: "Esmeralda",
    surfaceColor: "#ecfdf5",
    brandColor: "#022c22",
    accentColor: "#059669",
    textColor: "#022c22",
    mutedColor: "#047857",
    scope: "GLOBAL"
  },
  {
    id: "ESMERALDA_DARK",
    name: "Esmeralda oscuro",
    surfaceColor: "#021a14",
    brandColor: "#ecfdf5",
    accentColor: "#34d399",
    textColor: "#ecfdf5",
    mutedColor: "#6ee7b7",
    scope: "GLOBAL"
  },
  {
    id: "MOSTAZA_LIGHT",
    name: "Mostaza",
    surfaceColor: "#fefce8",
    brandColor: "#1c1a00",
    accentColor: "#ca8a04",
    textColor: "#1c1a00",
    mutedColor: "#a16207",
    scope: "GLOBAL"
  },
  {
    id: "MOSTAZA_DARK",
    name: "Mostaza oscuro",
    surfaceColor: "#0f0e00",
    brandColor: "#fefce8",
    accentColor: "#facc15",
    textColor: "#fefce8",
    mutedColor: "#fde047",
    scope: "GLOBAL"
  },
  {
    id: "RUBI_LIGHT",
    name: "Rubi",
    surfaceColor: "#fff1f2",
    brandColor: "#1f0506",
    accentColor: "#e11d48",
    textColor: "#1f0506",
    mutedColor: "#be123c",
    scope: "GLOBAL"
  },
  {
    id: "RUBI_DARK",
    name: "Rubi oscuro",
    surfaceColor: "#120304",
    brandColor: "#fff1f2",
    accentColor: "#fb7185",
    textColor: "#fff1f2",
    mutedColor: "#fda4af",
    scope: "GLOBAL"
  },
  {
    id: "COBALTO_LIGHT",
    name: "Cobalto",
    surfaceColor: "#eff6ff",
    brandColor: "#0c1929",
    accentColor: "#2563eb",
    textColor: "#0c1929",
    mutedColor: "#1d4ed8",
    scope: "GLOBAL"
  },
  {
    id: "COBALTO_DARK",
    name: "Cobalto oscuro",
    surfaceColor: "#030712",
    brandColor: "#f8fafc",
    accentColor: "#3b82f6",
    textColor: "#f8fafc",
    mutedColor: "#60a5fa",
    scope: "GLOBAL"
  },
  {
    id: "CITRICO_LIGHT",
    name: "Citrico",
    surfaceColor: "#fefffe",
    brandColor: "#132a00",
    accentColor: "#65a30d",
    textColor: "#132a00",
    mutedColor: "#4d7c0f",
    scope: "GLOBAL"
  },
  {
    id: "CITRICO_DARK",
    name: "Citrico oscuro",
    surfaceColor: "#0a1500",
    brandColor: "#f7fee7",
    accentColor: "#84cc16",
    textColor: "#f7fee7",
    mutedColor: "#a3e635",
    scope: "GLOBAL"
  },
  {
    id: "MAGENTA_LIGHT",
    name: "Magenta",
    surfaceColor: "#fdf4ff",
    brandColor: "#270033",
    accentColor: "#d946ef",
    textColor: "#270033",
    mutedColor: "#a21caf",
    scope: "GLOBAL"
  },
  {
    id: "MAGENTA_DARK",
    name: "Magenta oscuro",
    surfaceColor: "#120016",
    brandColor: "#fdf4ff",
    accentColor: "#e879f9",
    textColor: "#fdf4ff",
    mutedColor: "#f0abfc",
    scope: "GLOBAL"
  }
]

export const Tiers = [
  {
    id: Plan.BASIC,
    name: "Básico",
    priceMonthly: 0,
    priceYearly: 0,
    priceMonthlyId: "none",
    priceYearlyId: "none",
    description: "Plan gratuito para comenzar",
    features: ["Hasta 10 productos", "1 menú", "Código QR Personalizado"]
  },
  {
    id: Plan.PRO,
    name: "Pro",
    priceMonthly: 149,
    priceYearly: 1490,
    priceMonthlyId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    priceYearlyId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    description: "Plan para negocios en crecimiento",
    features: [
      "Productos y categorías ilimitadas",
      "Menús ilimitados",
      "Invitaciones a colaboradores",
      "Soporte por correo electrónico",
      "Analítica de visitas (Pronto)",
      "Promociones y ofertas (Pronto)"
    ]
  }
]

export type BulkMenuItem = {
  name: string
  description?: string
  price: number
  status?: string
  category?: string
  currency?: "MXN" | "USD"
}

export const bulkMenuItemSchema = z.array(
  z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    status: z.string().optional(),
    category: z.string().optional(),
    currency: z.enum(["MXN", "USD"]).optional()
  })
)

export const Allergens = [
  { value: "SEAFOOD", label: "Mariscos" },
  { value: "PEANUT", label: "Cacahuate" },
  { value: "LACTOSE", label: "Lactosa" },
  { value: "NUT", label: "Nueces" },
  { value: "GLUTEN", label: "Gluten" },
  { value: "FISH", label: "Pescado" },
  { value: "VEGETARIAN", label: "Vegetariano" },
  { value: "SPICY", label: "Picante" }
] as const
