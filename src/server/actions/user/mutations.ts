"use server"

import InviteUserEmail from "@/emails/invite"
import { nanoid } from "nanoid"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { Resend } from "resend"
import { z } from "zod"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { authActionClient } from "@/lib/safe-actions"
import { getCurrentUser } from "@/lib/session"
import { InviteStatus, MembershipRole } from "@/lib/types"
import { getBaseUrl } from "@/lib/utils"

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
          organizationId,
          isActive: true
        }
      })

      if (!membership) {
        return {
          failure: {
            reason: "No se encontro la membresía para esa organización"
          }
        }
      }

      // Set the current organization
      ;(await cookies()).set(appConfig.cookieOrg, organizationId, {
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
      const currentOrg = (await cookies()).get(appConfig.cookieOrg)?.value
      const baseUrl = getBaseUrl()

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
        },
        include: {
          organization: true
        }
      })

      if (!membership) {
        return {
          failure: {
            reason: "No se pudo obtener la información de la membresía"
          }
        }
      }

      // Check for an existing active invitation
      const existingInvite = await prisma.teamInvite.findFirst({
        where: {
          email,
          organizationId: currentOrg,
          status: InviteStatus.PENDING
        }
      })

      if (existingInvite) {
        // Update the existing invitation
        const updatedInvite = await prisma.teamInvite.update({
          where: {
            id: existingInvite.id
          },
          data: {
            token: nanoid(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
          }
        })

        // Send email
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Extract shortname from email address
        const shortname = email.split("@")[0]

        await resend.emails.send({
          from: "no-reply@biztro.co",
          to: email,
          subject: "Invitación para unirse a Biztro",
          react: InviteUserEmail({
            username: shortname,
            invitedByUsername: user?.name ?? undefined,
            invitedByEmail: user?.email,
            teamName: membership.organization.name,
            inviteLink: `${baseUrl}/invite/${updatedInvite.token}`,
            baseUrl
          })
        })

        return { success: true }
      } else {
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

        // Send email
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Extract shortname from email address
        const shortname = email.split("@")[0]

        await resend.emails.send({
          from: "no-reply@biztro.co",
          to: email,
          subject: "Invitación para unirse a Biztro",
          react: InviteUserEmail({
            username: shortname,
            invitedByUsername: user?.name ?? undefined,
            invitedByEmail: user?.email,
            teamName: membership.organization.name,
            inviteLink: `${baseUrl}/invite/${invitation.token}`,
            baseUrl
          })
        })

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
  .schema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
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

      // Get the team invite
      const invite = await prisma.teamInvite.findFirst({
        where: {
          id,
          email: user.email ?? "",
          status: InviteStatus.PENDING
        }
      })

      if (!invite) {
        return {
          failure: {
            reason: "No se pudo obtener la invitación"
          }
        }
      }

      // Accept the invite
      await prisma.teamInvite.update({
        where: {
          id
        },
        data: {
          status: InviteStatus.ACCEPTED,
          acceptedAt: new Date()
        }
      })

      // Add the user to the organization
      if (user.id && invite.organizationId) {
        await prisma.membership.create({
          data: {
            userId: user.id,
            organizationId: invite.organizationId,
            role: invite.role
          }
        })
      }

      // Set the current organization
      ;(await cookies()).set(appConfig.cookieOrg, invite.organizationId, {
        maxAge: 60 * 60 * 24 * 365
      })

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
