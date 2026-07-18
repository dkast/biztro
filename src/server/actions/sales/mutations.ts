"use server"

import { updateTag } from "next/cache"

import { isProMember } from "@/server/actions/user/queries"
import { type Currency } from "@/lib/currency"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  completeSaleSchema,
  voidReasonLabels,
  voidSaleSchema
} from "@/lib/types/sales"

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export const completeSale = authMemberActionClient
  .inputSchema(completeSaleSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!(await isProMember())) {
      return {
        failure: {
          reason: "Registrar ventas requiere el plan Pro"
        }
      }
    }

    if (!organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    const itemsByKey = new Map<
      string,
      {
        menuItemId: string
        variantId?: string
        quantity: number
      }
    >()

    for (const item of parsedInput.items) {
      const key = `${item.menuItemId}:${item.variantId ?? ""}`
      const existing = itemsByKey.get(key)

      if (existing) {
        existing.quantity += item.quantity
      } else {
        itemsByKey.set(key, { ...item })
      }
    }

    const cartItems = [...itemsByKey.values()]

    if (cartItems.length === 0) {
      return {
        failure: {
          reason: "Agrega al menos un producto"
        }
      }
    }

    const menuItemIds = [...new Set(cartItems.map(item => item.menuItemId))]

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds
        },
        organizationId,
        status: "ACTIVE"
      },
      include: {
        variants: {
          orderBy: {
            price: "asc"
          }
        }
      }
    })

    if (menuItems.length !== menuItemIds.length) {
      return {
        failure: {
          reason: "Uno o más productos ya no están disponibles"
        }
      }
    }

    const menuItemsById = new Map(menuItems.map(item => [item.id, item]))

    const resolvedItems = cartItems.map(line => {
      const menuItem = menuItemsById.get(line.menuItemId)

      if (!menuItem) {
        return null
      }

      const variants = menuItem.variants
      const selectedVariant = line.variantId
        ? variants.find(variant => variant.id === line.variantId)
        : variants.length === 1
          ? variants[0]
          : null

      if (!selectedVariant) {
        return null
      }

      return {
        menuItemId: menuItem.id,
        variantId: selectedVariant.id,
        productName: menuItem.name,
        variantName: selectedVariant.name,
        unitPrice: selectedVariant.price,
        quantity: line.quantity,
        lineTotal: roundMoney(selectedVariant.price * line.quantity),
        currency: menuItem.currency as Currency
      }
    })

    if (resolvedItems.some(item => !item)) {
      return {
        failure: {
          reason: "No se pudo preparar uno o más productos"
        }
      }
    }

    const salesItems = resolvedItems as Array<{
      menuItemId: string
      variantId: string
      productName: string
      variantName: string
      unitPrice: number
      quantity: number
      lineTotal: number
      currency: Currency
    }>

    const saleCurrency = salesItems[0]?.currency
    if (!saleCurrency) {
      return {
        failure: {
          reason: "No se pudo determinar la moneda de la venta"
        }
      }
    }

    if (salesItems.some(item => item.currency !== saleCurrency)) {
      return {
        failure: {
          reason: "No se pueden mezclar monedas en una sola venta"
        }
      }
    }

    const subtotal = roundMoney(
      salesItems.reduce((sum, item) => sum + item.lineTotal, 0)
    )
    const total = subtotal
    const itemCount = salesItems.reduce((sum, item) => sum + item.quantity, 0)

    const sale = await prisma.$transaction(async tx => {
      return await tx.sale.create({
        data: {
          organizationId,
          status: "COMPLETED",
          orderType: parsedInput.orderType,
          currency: saleCurrency,
          subtotal,
          total,
          completedAt: new Date(),
          completedByUserId: member.user.id,
          items: {
            create: salesItems.map(item => ({
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
        include: {
          items: true
        }
      })
    })

    updateTag(`sales-${organizationId}`)

    return {
      success: {
        id: sale.id,
        orderType: sale.orderType,
        total: sale.total,
        itemCount
      }
    }
  })

export const voidSale = authMemberActionClient
  .inputSchema(voidSaleSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    const voidReason =
      parsedInput.reason === "OTHER"
        ? parsedInput.reasonDetail!.trim()
        : voidReasonLabels[parsedInput.reason]

    const result = await prisma.sale.updateMany({
      where: {
        id: parsedInput.saleId,
        organizationId,
        status: "COMPLETED"
      },
      data: {
        status: "VOID",
        voidedAt: new Date(),
        voidedByUserId: member.user.id,
        voidReason
      }
    })

    if (result.count !== 1) {
      return {
        failure: {
          reason:
            "La venta no existe, no pertenece a esta organización o ya fue anulada"
        }
      }
    }

    updateTag(`sales-${organizationId}`)
    updateTag(`sale-${parsedInput.saleId}`)

    return {
      success: {
        id: parsedInput.saleId
      }
    }
  })
