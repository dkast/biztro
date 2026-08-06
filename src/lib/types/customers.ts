import { z } from "zod/v4"

export const customerNameSchema = z
  .string()
  .trim()
  .min(1, "Ingresa el nombre del cliente")
  .max(120)

export const customerSchema = z.object({
  name: customerNameSchema,
  phone: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo válido")
    .max(254)
    .optional(),
  notes: z.string().trim().max(500).optional()
})

export const updateCustomerSchema = customerSchema.extend({
  customerId: z.string().min(1)
})

export type CustomerInput = z.infer<typeof customerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>

export type CustomerOption = {
  id: string
  name: string
  phone: string | null
}

export type ReceivableCurrencySummary = {
  currency: "MXN" | "USD"
  balanceMinor: number
  openSales: number
}

export type ReceivableCustomer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  lastMovementAt: string
  summaries: ReceivableCurrencySummary[]
}

export type CustomerOpenSale = {
  id: string
  createdAt: string
  currency: "MXN" | "USD"
  totalMinor: number
  paidMinor: number
  balanceMinor: number
}

export type CustomerPaymentHistory = {
  id: string
  createdAt: string
  currency: "MXN" | "USD"
  amountMinor: number
  method: "CASH" | "CARD" | "TRANSFER" | "CODI" | "VOUCHER" | "LEGACY"
  status: "ACTIVE" | "VOID"
  reference: string | null
  notes: string | null
  allocationCount: number
}

export type CustomerReceivablesDetail = {
  customer: {
    id: string
    name: string
    phone: string | null
    email: string | null
    notes: string | null
  }
  openSales: CustomerOpenSale[]
  summaries: ReceivableCurrencySummary[]
  payments: CustomerPaymentHistory[]
}
