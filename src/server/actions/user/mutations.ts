"use server"

import { revalidateTag } from "next/cache"
import { cookies, headers } from "next/headers"
import { z } from "zod/v4"

import { appConfig } from "@/app/config"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { authActionClient } from "@/lib/safe-actions"
import { getCurrentUser } from "@/lib/session"
import { MembershipRole } from "@/lib/types"

export const switchOrganization = authActionClient
  .inputSchema(
    z.object({
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { organizationId } }) => {
    try {
      const data = await auth.api.setActiveOrganization({
        body: {
          organizationId
        },
        headers: await headers()
      })

      if (!data) {
        return {
          failure: {
            reason: "No se pudo cambiar de organización"
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Error switching organization:", error)
      return {
        failure: {
          reason: "Error cambiando de organización"
        }
      }
    }
  })

export const inviteMember = authActionClient
  .inputSchema(
    z.object({
      email: z.email()
    })
  )
  .action(async ({ parsedInput: { email } }) => {
    try {
      const data = await auth.api.createInvitation({
        body: {
          email,
          role: "member",
          resend: true
        },
        headers: await headers()
      })

      if (data) {
        return { success: true }
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      return {
        failure: {
          reason: "Error invitando al miembro"
        }
      }
    }
  })

export const acceptInvite = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await auth.api.acceptInvitation({
        body: {
          invitationId: id
        },
        headers: await headers()
      })

      if (!data) {
        return {
          failure: {
            reason: "No se pudo aceptar la invitación"
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Error accepting invite:", error)
      return {
        failure: {
          reason: "Error aceptando la invitación"
        }
      }
    }
  })

export const removeMember = authActionClient
  .inputSchema(
    z.object({
      memberId: z.string()
    })
  )
  .action(async ({ parsedInput: { memberId } }) => {
    try {
      // Get the membership
      const membership = await prisma.membership.findFirst({
        where: {
          id: memberId,
          role: MembershipRole.MEMBER
        }
      })

      if (!membership) {
        return {
          failure: {
            reason: "No se pudo obtener la membresía"
          }
        }
      }

      // Remove the membership
      await prisma.membership.delete({
        where: {
          id: memberId
        }
      })

      revalidateTag(`members-${membership.organizationId}`)

      return { success: true }
    } catch (error) {
      console.error("Error removing member:", error)
      return {
        failure: {
          reason: "Error eliminando al miembro"
        }
      }
    }
  })

export const deactivateMember = authActionClient
  .inputSchema(
    z.object({
      memberId: z.string()
    })
  )
  .action(async ({ parsedInput: { memberId } }) => {
    try {
      // Get the membership
      const membership = await prisma.membership.findFirst({
        where: {
          id: memberId,
          role: MembershipRole.MEMBER
        }
      })

      if (!membership) {
        return {
          failure: {
            reason: "No se pudo obtener la membresía"
          }
        }
      }

      // Deactivate the membership
      await prisma.membership.update({
        where: {
          id: memberId
        },
        data: {
          isActive: false
        }
      })

      revalidateTag(`members-${membership.organizationId}`)

      return { success: true }
    } catch (error) {
      console.error("Error deactivating member:", error)
      return {
        failure: {
          reason: "Error desactivando al miembro"
        }
      }
    }
  })
