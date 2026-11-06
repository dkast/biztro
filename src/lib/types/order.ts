import { z } from "zod/v4"

import type { Currency } from "@/lib/currency"
import {
  orderContextSchema,
  orderRequestIdSchema
} from "@/lib/types/order-context"
import { paymentAmountSchema, paymentMethodSchema } from "@/lib/types/payments"
import {
  saleCartItemSchema,
  salesOrderTypeSchema,
  type SalesOrderType
} from "@/lib/types/sales"

export const paymentTimingValues = ["PAY_FIRST", "PAY_ON_DELIVERY"] as const

export const paymentTimingSchema = z.enum(paymentTimingValues)

export type PaymentTiming = z.infer<typeof paymentTimingSchema>

export const paymentTimingLabels = {
  PAY_FIRST: "Cobrar al ordenar",
  PAY_ON_DELIVERY: "Cobrar al entregar"
} as const satisfies Record<PaymentTiming, string>

export const paymentTimingDescriptions = {
  PAY_FIRST:
    "La venta se cobra en el punto de venta y después se envía a cocina.",
  PAY_ON_DELIVERY:
    "La orden se envía a cocina sin cobrar y se cobra desde Por cobrar al entregarla."
} as const satisfies Record<PaymentTiming, string>

export const orderStatusValues = ["OPEN", "SETTLED", "CANCELLED"] as const

export type OrderStatus = (typeof orderStatusValues)[number]

export const kitchenStatusValues = ["NEW", "PREPARING", "READY"] as const

export const kitchenStatusSchema = z.enum(kitchenStatusValues)

export type KitchenStatus = z.infer<typeof kitchenStatusSchema>

export const kitchenStatusLabels = {
  NEW: "Nueva",
  PREPARING: "Preparando",
  READY: "Lista"
} as const satisfies Record<KitchenStatus, string>

export const orderCancelReasonMaxLength = 300

export const kitchenStatusBadgeVariants = {
  NEW: "blue",
  PREPARING: "yellow",
  READY: "green"
} as const satisfies Record<KitchenStatus, "blue" | "yellow" | "green">

export const submitOrderSchema = orderContextSchema.extend({
  requestId: orderRequestIdSchema,
  orderType: salesOrderTypeSchema.default("DINE_IN"),
  items: z.array(saleCartItemSchema).min(1, "Agrega al menos un producto")
})

export const kitchenTransitionSchema = z.object({
  orderId: z.string().min(1),
  from: kitchenStatusSchema
})

export const restoreKitchenOrderSchema = z.object({
  orderId: z.string().min(1)
})

export const acknowledgeOrderCancellationSchema = z.object({
  orderId: z.string().min(1)
})

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(1, "Describe el motivo de la cancelación")
    .max(orderCancelReasonMaxLength, "Usa máximo 300 caracteres")
})

export const settleOrderSchema = z.object({
  orderId: z.string().min(1),
  customerId: z.string().min(1).optional(),
  payments: z.array(
    z.object({
      method: paymentMethodSchema,
      amount: paymentAmountSchema,
      reference: z.string().trim().max(120).optional(),
      notes: z.string().trim().max(500).optional()
    })
  ),
  acceptsCredit: z.boolean().default(false)
})

export type SubmitOrderInput = z.infer<typeof submitOrderSchema>
export type KitchenTransitionInput = z.infer<typeof kitchenTransitionSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
export type SettleOrderInput = z.infer<typeof settleOrderSchema>

export type OrderTicketItem = {
  id: string
  productName: string
  variantName: string | null
  quantity: number
}

export type OrderTicket = {
  id: string
  number: number
  status: OrderStatus
  kitchenStatus: KitchenStatus
  paymentTiming: PaymentTiming
  orderType: SalesOrderType
  label: string | null
  notes: string | null
  submittedAt: string
  preparingAt: string | null
  readyAt: string | null
  items: OrderTicketItem[]
}

export type KitchenCancellationNotice = {
  id: string
  number: number
  label: string | null
  cancelReason: string | null
  cancelledAt: string
}

export type KitchenBoardData = {
  serverTime: string
  active: OrderTicket[]
  cancellations: KitchenCancellationNotice[]
}

export type KitchenReadyPage = {
  serverTime: string
  orders: OrderTicket[]
  totalCount: number
  page: number
  pageSize: number
}

export type PendingOrder = OrderTicket & {
  currency: Currency
  total: number
}

export type PendingOrdersData = {
  serverTime: string
  orders: PendingOrder[]
}
