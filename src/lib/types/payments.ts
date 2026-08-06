import { z } from "zod/v4"

import { decimalToMinorUnits } from "@/lib/payments"

export const paymentMethodValues = [
  "CASH",
  "CARD",
  "TRANSFER",
  "CODI",
  "VOUCHER"
] as const

export const paymentMethodSchema = z.enum(paymentMethodValues)

export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export const paymentMethodLabels = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  CODI: "CoDi",
  VOUCHER: "Vale"
} as const satisfies Record<PaymentMethod, string>

export const paymentStatusValues = ["PENDING", "PARTIAL", "PAID"] as const

export const paymentStatusSchema = z.enum(paymentStatusValues)

export type PaymentStatus = z.infer<typeof paymentStatusSchema>

export const paymentStatusLabels = {
  PENDING: "Pendiente",
  PARTIAL: "Parcialmente pagada",
  PAID: "Pagada"
} as const satisfies Record<PaymentStatus, string>

export const paymentAmountSchema = z.number().refine(
  value => {
    try {
      decimalToMinorUnits(value)
      return true
    } catch {
      return false
    }
  },
  {
    message: "Ingresa un monto mayor a cero con hasta dos decimales"
  }
)

export const paymentInputSchema = z.object({
  method: paymentMethodSchema,
  amount: paymentAmountSchema,
  reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional()
})

export const registerCustomerPaymentSchema = paymentInputSchema.extend({
  customerId: z.string().min(1),
  currency: z.enum(["MXN", "USD"])
})

export const voidPaymentSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().trim().min(1, "Describe el motivo").max(500)
})

export type PaymentInput = z.infer<typeof paymentInputSchema>
export type RegisterCustomerPaymentInput = z.infer<
  typeof registerCustomerPaymentSchema
>
export type VoidPaymentInput = z.infer<typeof voidPaymentSchema>

export type PaymentStatusSummary = {
  paymentStatus: PaymentStatus
  paidMinor: number
  balanceMinor: number
}

export type SalePaymentHistoryItem = {
  id: string
  createdAt: string
  method: PaymentMethod | "LEGACY"
  amountMinor: number
  allocatedMinor: number
  reference: string | null
  notes: string | null
  status: "ACTIVE" | "VOID"
  createdBy: { id: string; name: string } | null
  voidedAt: string | null
  voidReason: string | null
  allocationCount: number
}
