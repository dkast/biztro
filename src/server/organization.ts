"use server"

import { revalidateTag } from "next/cache"

import prisma from "@/lib/prisma"
import { action } from "@/lib/safe-actions"
import { getCurrentUser } from "@/lib/session"
import { orgSchema } from "@/lib/types"

export const createOrg = action(
  orgSchema,
  async ({ name, description, subdomain }) => {
    try {
      const org = await prisma.organization.create({
        data: {
          name,
          description,
          subdomain
        }
      })

      revalidateTag(`organization-${org.id}`)

      return { success: true }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Error) {
        message = error.message
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  }
)

export const bootstrapOrg = action(
  orgSchema,
  async ({ name, description, subdomain }) => {
    try {
      const user = await getCurrentUser()

      if (!user) {
        return {
          failure: {
            reason: "No se pudo obtener el usuario actual"
          }
        }
      }

      const org = await prisma.organization.create({
        data: {
          name,
          description,
          subdomain
        }
      })

      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "OWNER"
        }
      })

      revalidateTag(`organization-${org.id}`)
      revalidateTag(`memberships-${org.id}`)

      return { success: true }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Error) {
        message = error.message
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  }
)
