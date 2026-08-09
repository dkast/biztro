"use server"

import { cacheLife, cacheTag } from "next/cache"

import { calculateBalanceMinor, currencyToMinorUnits } from "@/lib/payments"
import prisma from "@/lib/prisma"
import {
  paymentMethodValues,
  type OrganizationPaymentSettings,
  type PaymentMethod
} from "@/lib/types/payments"

export type PaymentFeatureState = OrganizationPaymentSettings & {
  acceptedMethods: PaymentMethod[]
  hasCreditHistory: boolean
  outstandingMinor: number
  customersWithBalance: number
  openSales: number
}

function getAcceptedMethods(
  settings: OrganizationPaymentSettings
): PaymentMethod[] {
  const settingKeys = {
    CASH: "acceptsCash",
    CARD: "acceptsCard",
    TRANSFER: "acceptsTransfer",
    CODI: "acceptsCodi",
    VOUCHER: "acceptsVoucher"
  } as const

  return paymentMethodValues.filter(method => settings[settingKeys[method]])
}

export async function getPaymentFeatureState(
  organizationId: string
): Promise<PaymentFeatureState | null> {
  "use cache: private"
  cacheLife({ stale: 30 })

  if (!organizationId) return null

  cacheTag(`payment-settings-${organizationId}`)
  cacheTag(`receivables-${organizationId}`)

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      acceptsCash: true,
      acceptsCard: true,
      acceptsTransfer: true,
      acceptsCodi: true,
      acceptsVoucher: true,
      creditEnabled: true,
      sales: {
        where: { status: "COMPLETED" },
        select: {
          customerId: true,
          total: true,
          paymentAllocations: {
            select: {
              amountMinor: true,
              payment: {
                select: {
                  status: true,
                  origin: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!organization) return null

  const settings: OrganizationPaymentSettings = {
    acceptsCash: organization.acceptsCash,
    acceptsCard: organization.acceptsCard,
    acceptsTransfer: organization.acceptsTransfer,
    acceptsCodi: organization.acceptsCodi,
    acceptsVoucher: organization.acceptsVoucher,
    creditEnabled: organization.creditEnabled
  }

  let hasCreditHistory = false
  let outstandingMinor = 0
  let openSales = 0
  const customersWithBalance = new Set<string>()

  for (const sale of organization.sales) {
    const totalMinor = currencyToMinorUnits(sale.total)
    let paidAtSaleMinor = 0
    let paidMinor = 0

    for (const allocation of sale.paymentAllocations) {
      if (allocation.payment.status !== "ACTIVE") continue

      paidMinor += allocation.amountMinor
      if (allocation.payment.origin === "SALE") {
        paidAtSaleMinor += allocation.amountMinor
      }
    }

    if (sale.customerId && totalMinor > paidAtSaleMinor) {
      hasCreditHistory = true
    }

    const balanceMinor = calculateBalanceMinor(totalMinor, paidMinor)
    if (balanceMinor === 0 || !sale.customerId) continue

    outstandingMinor += balanceMinor
    openSales += 1
    customersWithBalance.add(sale.customerId)
  }

  return {
    ...settings,
    acceptedMethods: getAcceptedMethods(settings),
    hasCreditHistory,
    outstandingMinor,
    customersWithBalance: customersWithBalance.size,
    openSales
  }
}
