import "server-only"

import { Prisma } from "@/generated/prisma-client/client"

import type { Currency } from "@/lib/currency"
import type { CartItemInput } from "@/lib/orders"
import { decimalToMinorUnits } from "@/lib/payments"
import type prisma from "@/lib/prisma"
import type { PaymentTiming } from "@/lib/types/order"
import {
  isPaymentMethodAccepted,
  type PaymentMethod
} from "@/lib/types/payments"
import type { SalesOrderType } from "@/lib/types/sales"

type Db = Prisma.TransactionClient | typeof prisma

export type SnapshotItem = {
  menuItemId: string | null
  variantId: string | null
  productName: string
  variantName: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export async function resolveCatalogItems(
  db: Db,
  organizationId: string,
  cartItems: CartItemInput[]
): Promise<
  | { failure: string }
  | { items: SnapshotItem[]; currency: Currency; total: number }
> {
  if (cartItems.length === 0) return { failure: "Agrega al menos un producto" }

  const menuItemIds = [...new Set(cartItems.map(item => item.menuItemId))]
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds }, organizationId, status: "ACTIVE" },
    include: { variants: { orderBy: { price: "asc" } } }
  })

  if (menuItems.length !== menuItemIds.length) {
    return { failure: "Uno o más productos ya no están disponibles" }
  }

  const menuItemsById = new Map(menuItems.map(item => [item.id, item]))
  const items: SnapshotItem[] = []
  let currency: Currency | null = null

  for (const line of cartItems) {
    const menuItem = menuItemsById.get(line.menuItemId)
    if (!menuItem) return { failure: "No se pudo preparar uno o más productos" }

    const selectedVariant = line.variantId
      ? menuItem.variants.find(variant => variant.id === line.variantId)
      : menuItem.variants.length === 1
        ? menuItem.variants[0]
        : null

    if (!selectedVariant) {
      return { failure: "No se pudo preparar uno o más productos" }
    }

    const itemCurrency = menuItem.currency as Currency
    if (currency && currency !== itemCurrency) {
      return { failure: "No se pueden mezclar monedas en una sola venta" }
    }
    currency = itemCurrency

    items.push({
      menuItemId: menuItem.id,
      variantId: selectedVariant.id,
      productName: menuItem.name,
      variantName: selectedVariant.name,
      unitPrice: selectedVariant.price,
      quantity: line.quantity,
      lineTotal: roundMoney(selectedVariant.price * line.quantity)
    })
  }

  if (!currency) {
    return { failure: "No se pudo determinar la moneda de la venta" }
  }

  return {
    items,
    currency,
    total: roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0))
  }
}

export async function recordSale(
  tx: Prisma.TransactionClient,
  {
    organizationId,
    userId,
    orderType,
    currency,
    total,
    items,
    customerId,
    payments,
    balanceMinor
  }: {
    organizationId: string
    userId: string
    orderType: SalesOrderType
    currency: Currency
    total: number
    items: SnapshotItem[]
    customerId?: string
    payments: Array<{
      method: PaymentMethod
      amount: number
      reference?: string
      notes?: string
    }>
    balanceMinor: number
  }
) {
  const organization = await tx.organization.findUnique({
    where: { id: organizationId },
    select: {
      acceptsCash: true,
      acceptsCard: true,
      acceptsTransfer: true,
      acceptsCodi: true,
      acceptsVoucher: true,
      creditEnabled: true
    }
  })

  if (!organization) {
    return { failure: "No se pudo obtener la organización actual" as const }
  }

  if (
    payments.some(
      payment => !isPaymentMethodAccepted(organization, payment.method)
    )
  ) {
    return {
      failure: "Uno o más métodos de pago no están habilitados" as const
    }
  }

  if (balanceMinor > 0 && !organization.creditEnabled) {
    return {
      failure: "El crédito no está habilitado para esta organización" as const
    }
  }

  if (customerId) {
    const customer = await tx.customer.findFirst({
      where: { id: customerId, organizationId },
      select: { id: true }
    })

    if (!customer) {
      return {
        failure:
          "El cliente seleccionado no pertenece a esta organización" as const
      }
    }
  }

  const sale = await tx.sale.create({
    data: {
      organizationId,
      status: "COMPLETED",
      orderType,
      currency,
      subtotal: total,
      total,
      customerId,
      completedAt: new Date(),
      completedByUserId: userId,
      items: {
        create: items.map(item => ({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal
        }))
      }
    },
    select: { id: true, orderType: true, total: true }
  })

  for (const payment of payments) {
    const amountMinor = decimalToMinorUnits(payment.amount)

    await tx.payment.create({
      data: {
        organizationId,
        customerId,
        currency,
        amountMinor,
        method: payment.method,
        origin: "SALE",
        reference: payment.reference || null,
        notes: payment.notes || null,
        createdByUserId: userId,
        allocations: { create: { saleId: sale.id, amountMinor } }
      }
    })
  }

  return { success: sale }
}

export async function createOrderRecord(
  tx: Prisma.TransactionClient,
  {
    organizationId,
    userId,
    paymentTiming,
    orderType,
    currency,
    total,
    items,
    label,
    notes,
    requestId,
    saleId
  }: {
    organizationId: string
    userId: string
    paymentTiming: PaymentTiming
    orderType: SalesOrderType
    currency: Currency
    total: number
    items: SnapshotItem[]
    label: string | null
    notes: string | null
    requestId: string | null
    saleId?: string
  }
) {
  const lastOrder = await tx.order.findFirst({
    where: { organizationId },
    orderBy: { number: "desc" },
    select: { number: true }
  })
  const now = new Date()

  return tx.order.create({
    data: {
      organizationId,
      number: (lastOrder?.number ?? 0) + 1,
      status: saleId ? "SETTLED" : "OPEN",
      paymentTiming,
      orderType,
      currency,
      total,
      label,
      notes,
      requestId,
      createdByUserId: userId,
      submittedAt: now,
      settledAt: saleId ? now : null,
      saleId,
      items: {
        create: items.map(item => ({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal
        }))
      }
    },
    select: { id: true, number: true, saleId: true }
  })
}

export function isUniqueConstraintError(error: unknown, field?: string) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false
  }

  if (!field) return true

  const target = error.meta?.target
  const serialized = Array.isArray(target)
    ? target.join(",")
    : JSON.stringify(error.meta ?? {})
  return serialized.includes(field)
}

// Order numbers are allocated as max + 1; concurrent submissions can collide on
// the unique constraint, so retry the whole transaction a few times.
export async function withOrderNumberRetry<T>(run: () => Promise<T>) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run()
    } catch (error) {
      if (attempt >= 4 || !isUniqueConstraintError(error, "number")) throw error
    }
  }
}
