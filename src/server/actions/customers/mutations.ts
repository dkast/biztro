"use server"

import { updateTag } from "next/cache"

import { MISSING_ORGANIZATION_REASON } from "@/server/actions/tenant-guards"
import { isProMember } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import { customerSchema, updateCustomerSchema } from "@/lib/types/customers"

function invalidateCustomerTags(organizationId: string, customerId?: string) {
  updateTag(`customers-${organizationId}`)
  updateTag(`receivables-${organizationId}`)
  updateTag(`sales-${organizationId}`)

  if (customerId) updateTag(`customer-${customerId}`)
}

export const createCustomer = authMemberActionClient
  .inputSchema(customerSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return { failure: { reason: MISSING_ORGANIZATION_REASON } }
    }

    if (!(await isProMember())) {
      return {
        failure: {
          reason: "Registrar clientes requiere el plan Pro"
        }
      }
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId,
        name: parsedInput.name,
        phone: parsedInput.phone || null,
        email: parsedInput.email || null,
        notes: parsedInput.notes || null
      },
      select: {
        id: true,
        name: true,
        phone: true
      }
    })

    invalidateCustomerTags(organizationId, customer.id)

    return { success: customer }
  })

export const updateCustomer = authMemberActionClient
  .inputSchema(updateCustomerSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return { failure: { reason: MISSING_ORGANIZATION_REASON } }
    }

    const result = await prisma.customer.updateMany({
      where: {
        id: parsedInput.customerId,
        organizationId
      },
      data: {
        name: parsedInput.name,
        phone: parsedInput.phone || null,
        email: parsedInput.email || null,
        notes: parsedInput.notes || null
      }
    })

    if (result.count !== 1) {
      return { failure: { reason: "Cliente no encontrado" } }
    }

    invalidateCustomerTags(organizationId, parsedInput.customerId)

    return { success: { id: parsedInput.customerId } }
  })
