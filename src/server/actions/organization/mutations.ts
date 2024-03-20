"use server"

import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { action } from "@/lib/safe-actions"
import { getCurrentUser } from "@/lib/session"
import { orgSchema } from "@/lib/types"

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

      // Set the current organization
      cookies().set(appConfig.cookieOrg, org.id, {
        maxAge: 60 * 60 * 24 * 365
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

export const updateOrg = action(
  orgSchema,
  async ({ id, name, description, subdomain }) => {
    try {
      await prisma.organization.update({
        where: {
          id
        },
        data: {
          name,
          description,
          subdomain
        }
      })

      revalidateTag(`organization-${id}`)

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
