export enum BasicPlanLimits {
  ITEM_LIMIT_REACHED = "ITEM_LIMIT_REACHED",
  MENU_LIMIT_REACHED = "MENU_LIMIT_REACHED"
}

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  INCOMPLETE = "INCOMPLETE",
  INCOMPLETE_EXPIRED = "INCOMPLETE_EXPIRED",
  PAST_DUE = "PAST_DUE",
  UNPAID = "UNPAID",
  PAUSED = "PAUSED",
  SPONSORED = "SPONSORED"
}

export const enum Plan {
  BASIC = "BASIC",
  PRO = "PRO"
}

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
