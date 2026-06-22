import { z } from "zod/v4"

import type { Currency } from "@/lib/currency"
import type { SalesDashboardPeriod } from "@/lib/sales-dashboard-period"

export const salesOrderTypeValues = ["DINE_IN", "TAKEOUT", "DELIVERY"] as const

export const salesOrderTypeSchema = z.enum(salesOrderTypeValues)

export type SalesOrderType = z.infer<typeof salesOrderTypeSchema>

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

export type SaleCartItemInput = z.infer<typeof saleCartItemSchema>
export type CompleteSaleInput = z.infer<typeof completeSaleSchema>

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

export type SalesClosingData = {
  currency: Currency
  todayRevenue: number
  todayOrders: number
  bestSellers: SalesBestSeller[]
  revenueByOrderType: SalesRevenueByOrderType[]
}
