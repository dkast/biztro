"use server"

import { nanoid } from "nanoid"
import { cookies } from "next/headers"
import { z } from "zod"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { authActionClient } from "@/lib/safe-actions"
import { getCurrentUser } from "@/lib/session"
import { InviteStatus, MembershipRole } from "@/lib/types"

// export const assignOrganization = authActionClient
//   .schema(
//     z.object({
//       cookieName: z.string(),
//       organizationId: z.string()
//     })
//   )
//   .action(
//     // skipcq: JS-0116
//     async ({ parsedInput: { cookieName, organizationId } }) => {
//       cookies().set(cookieName, organizationId, {
//         maxAge: 60 * 60 * 24 * 365
//       })
//     }
//   )

export const switchOrganization = authActionClient
  .schema(
    z.object({
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { organizationId } }) => {
    try {
      // Get the current user
      const user = await getCurrentUser()

      if (!user) {
        return {
          failure: {
            reason: "No se pudo obtener el usuario actual"
          }
        }
      }

      // Get the membership
      const membership = await prisma.membership.findFirst({
        where: {
          userId: user.id,
          organizationId
        }
      })

      if (!membership) {
        return {
          failure: {
            reason: "No se pudo obtener la membresía"
          }
        }
      }

      // Set the current organization
      cookies().set(appConfig.cookieOrg, organizationId, {
        maxAge: 60 * 60 * 24 * 365
      })

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
  .schema(
    z.object({
      email: z.string().email()
    })
  )
  .action(async ({ parsedInput: { email } }) => {
    try {
      // Get the current organization
      const currentOrg = cookies().get(appConfig.cookieOrg)?.value

      // Get the current user
      const user = await getCurrentUser()

      if (!currentOrg) {
        return {
          failure: {
            reason: "No se pudo obtener la organización actual"
          }
        }
      }

      const membership = await prisma.membership.findFirst({
        where: {
          userId: user?.id,
          organizationId: currentOrg
        }
      })

      if (!membership) {
        return {
          failure: {
            reason: "No se pudo obtener la información de la membresía"
          }
        }
      }

      // Create the invitation
      const invitation = await prisma.teamInvite.create({
        data: {
          email,
          token: nanoid(),
          organizationId: currentOrg,
          role: MembershipRole.MEMBER,
          status: InviteStatus.PENDING,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
          invitedById: membership?.id
        }
      })

      // TODO: Send email

      return { success: true }
    } catch (error) {
      console.error("Error inviting member:", error)
      return {
        failure: {
          reason: "Error invitando al miembro"
        }
      }
    }
  })

export const removeMember = authActionClient
  .schema(
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
  .schema(
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
