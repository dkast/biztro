import { z } from "zod/v4"

import type { Currency } from "@/lib/currency"
import type { SalesDashboardPeriod } from "@/lib/sales-dashboard-period"

export const salesOrderTypeValues = ["DINE_IN", "TAKEOUT", "DELIVERY"] as const

export const salesOrderTypeSchema = z.enum(salesOrderTypeValues)

export type SalesOrderType = z.infer<typeof salesOrderTypeSchema>

export const saleStatusValues = ["COMPLETED", "VOID"] as const

export const saleStatusSchema = z.enum(saleStatusValues)

export type SaleStatus = z.infer<typeof saleStatusSchema>

export const saleStatusLabels = {
  COMPLETED: "Completada",
  VOID: "Anulada"
} as const satisfies Record<SaleStatus, string>

export const voidReasonValues = [
  "WRONG_ITEMS",
  "DUPLICATE_SALE",
  "CUSTOMER_CANCELLED",
  "TEST_SALE",
  "OTHER"
] as const

export const voidReasonSchema = z.enum(voidReasonValues)

export type VoidReason = z.infer<typeof voidReasonSchema>

export const voidReasonLabels = {
  WRONG_ITEMS: "Productos incorrectos",
  DUPLICATE_SALE: "Venta duplicada",
  CUSTOMER_CANCELLED: "Cliente canceló",
  TEST_SALE: "Venta de prueba",
  OTHER: "Otro"
} as const satisfies Record<VoidReason, string>

export const salesOrderTypeLabels = {
  DINE_IN: "Para aquí",
  TAKEOUT: "Para llevar",
  DELIVERY: "Entrega"
} as const satisfies Record<SalesOrderType, string>

export const salesOrderTypeBadgeVariants = {
  DINE_IN: "blue",
  TAKEOUT: "indigo",
  DELIVERY: "yellow"
} as const satisfies Record<SalesOrderType, "blue" | "indigo" | "yellow">

export const salesOrderTypeOptions = salesOrderTypeValues.map(value => ({
  value,
  label: salesOrderTypeLabels[value]
}))

export const saleCartItemSchema = z.object({
  menuItemId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1)
})

export const completeSaleSchema = z.object({
  orderType: salesOrderTypeSchema.default("DINE_IN"),
  items: z.array(saleCartItemSchema).min(1, "Agrega al menos un producto")
})

export const voidSaleSchema = z
  .object({
    saleId: z.string().min(1),
    reason: voidReasonSchema,
    reasonDetail: z.string().trim().max(500).optional()
  })
  .superRefine(({ reason, reasonDetail }, ctx) => {
    if (reason === "OTHER" && !reasonDetail) {
      ctx.addIssue({
        code: "custom",
        path: ["reasonDetail"],
        message: "Describe el motivo de la anulación"
      })
    }
  })

export type SaleCartItemInput = z.infer<typeof saleCartItemSchema>
export type CompleteSaleInput = z.infer<typeof completeSaleSchema>
export type VoidSaleInput = z.infer<typeof voidSaleSchema>

export type SalesCatalogVariant = {
  id: string
  name: string
  description: string | null
  price: number
}

export type SalesCatalogProduct = {
  id: string
  name: string
  description: string | null
  image: string | null
  categoryId: string | null
  categoryName: string | null
  currency: Currency
  price: number
  priceLabel: string
  variantCount: number
  variants: SalesCatalogVariant[]
}

export type SalesCatalogCategory = {
  id: string
  name: string
  itemCount: number
}

export type SalesCatalogData = {
  categories: SalesCatalogCategory[]
  products: SalesCatalogProduct[]
  uncategorizedCount: number
}

export type SalesBestSeller = {
  productName: string
  quantity: number
  revenue: number
}

export type SalesRecentSale = {
  id: string
  createdAt: string
  orderType: SalesOrderType
  status: SaleStatus
  items: number
  total: number
}

export type SalesRevenueByOrderType = {
  orderType: SalesOrderType
  revenue: number
  orders: number
}

export type SalesChartBucket = {
  label: string
  revenue: number
  orders: number
}

export type SalesDashboardData = {
  currency: Currency
  period: SalesDashboardPeriod
  todayRevenue: number
  todayOrders: number
  periodRevenue: number
  periodOrders: number
  periodAverageTicket: number
  chart: SalesChartBucket[]
  bestSellers: SalesBestSeller[]
  recentSales: SalesRecentSale[]
}

export type SalesClosingHourlyBucket = {
  hour: number
  label: string
  todayOrders: number
  todayRevenue: number
  previousOrders: number
  previousRevenue: number
}

export type SalesClosingComparison = {
  revenue: number
  orders: number
  averageTicket: number
}

export type SalesClosingData = {
  selectedDateValue: string
  previousDateValue: string
  currency: Currency
  todayRevenue: number
  todayOrders: number
  todayAverageTicket: number
  voidedSales: number
  voidedAmount: number
  topProduct: SalesBestSeller | null
  previous: SalesClosingComparison
  bestSellers: SalesBestSeller[]
  revenueByOrderType: SalesRevenueByOrderType[]
  hourly: SalesClosingHourlyBucket[]
  recentSales: SalesRecentSale[]
}

export type SalesActor = {
  id: string
  name: string
}

export type SaleDetail = {
  id: string
  status: SaleStatus
  orderType: SalesOrderType
  currency: Currency
  total: number
  createdAt: string
  completedAt: string | null
  completedBy: SalesActor | null
  voidedAt: string | null
  voidedBy: SalesActor | null
  voidReason: string | null
  items: Array<{
    id: string
    productName: string
    variantName: string | null
    unitPrice: number
    quantity: number
    lineTotal: number
  }>
}
