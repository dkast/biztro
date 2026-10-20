import { currencyToMinorUnits, decimalToMinorUnits } from "@/lib/payments"
import type { KitchenStatus } from "@/lib/types/order"

export const kitchenRefreshIntervalMs = 5_000
export const kitchenStaleAfterMs = 20_000
export const kitchenReadyPageSize = 12

const nextKitchenStatus = {
  NEW: "PREPARING",
  PREPARING: "READY",
  READY: null
} as const satisfies Record<KitchenStatus, KitchenStatus | null>

export function getNextKitchenStatus(status: KitchenStatus) {
  return nextKitchenStatus[status]
}

// Minimum board widths (px) that keep tickets legible with 48px+ touch targets.
const kitchenColumnBreakpoints = [
  { minWidth: 1360, columns: 5 },
  { minWidth: 820, columns: 3 },
  { minWidth: 520, columns: 2 }
] as const

export function getKitchenBoardColumns(boardWidth: number) {
  return (
    kitchenColumnBreakpoints.find(
      breakpoint => boardWidth >= breakpoint.minWidth
    )?.columns ?? 1
  )
}

export function getKitchenPageSize(columns: number) {
  return columns > 1 ? columns * 2 : 4
}

export function paginate<T>(items: readonly T[], page: number, size: number) {
  const pageSize = Math.max(1, Math.floor(size))
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(
    Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1),
    pageCount
  )
  const start = (currentPage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    pageCount,
    remaining: Math.max(0, items.length - (start + pageSize))
  }
}

export function getElapsedMinutes(from: string | Date, now: number) {
  const startedAt = typeof from === "string" ? Date.parse(from) : from.getTime()
  if (!Number.isFinite(startedAt)) return 0

  return Math.max(0, Math.floor((now - startedAt) / 60_000))
}

export type ElapsedTone = "normal" | "warning" | "critical"

export function getElapsedTone(minutes: number): ElapsedTone {
  if (minutes >= 20) return "critical"
  if (minutes >= 10) return "warning"
  return "normal"
}

export function formatElapsed(minutes: number) {
  if (minutes < 1) return "Ahora"
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export function formatOrderNumber(number: number) {
  return `#${number}`
}

export function normalizeOptionalText(value: string | undefined | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export type CartItemInput = {
  menuItemId: string
  variantId?: string
  quantity: number
}

export function mergeCartItems(items: readonly CartItemInput[]) {
  const itemsByKey = new Map<string, CartItemInput>()

  for (const item of items) {
    const key = `${item.menuItemId}:${item.variantId ?? ""}`
    const existing = itemsByKey.get(key)

    if (existing) existing.quantity += item.quantity
    else itemsByKey.set(key, { ...item })
  }

  return [...itemsByKey.values()]
}

export type SalePaymentCheck =
  | { failure: string }
  | { totalMinor: number; paymentsMinor: number; balanceMinor: number }

export function checkSalePayments({
  total,
  payments,
  customerId,
  acceptsCredit
}: {
  total: number
  payments: ReadonlyArray<{ amount: number }>
  customerId?: string
  acceptsCredit: boolean
}): SalePaymentCheck {
  const totalMinor = currencyToMinorUnits(total)
  const paymentsMinor = payments.reduce(
    (sum, payment) => sum + decimalToMinorUnits(payment.amount),
    0
  )

  if (paymentsMinor > totalMinor) {
    return { failure: "Los pagos no pueden superar el total de la venta" }
  }

  const balanceMinor = totalMinor - paymentsMinor

  if (balanceMinor > 0 && !customerId) {
    return { failure: "Selecciona un cliente para registrar saldo a crédito" }
  }

  if (balanceMinor > 0 && !acceptsCredit) {
    return {
      failure: "Confirma el saldo a crédito antes de completar la venta"
    }
  }

  return { totalMinor, paymentsMinor, balanceMinor }
}
