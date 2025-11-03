"use server"

import { refresh, updateTag } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod/v4"

import { auth } from "@/lib/auth"
import { authActionClient } from "@/lib/safe-actions"

export const switchOrganization = authActionClient
  .inputSchema(
    z.object({
      organizationId: z.string(),
      currentOrganizationId: z.string()
    })
  )
  .action(
    async ({ parsedInput: { organizationId, currentOrganizationId } }) => {
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

        // Use the previous/current organization id to update the cache tag
        updateTag("menus-" + currentOrganizationId)
        return { success: true }
      } catch (error) {
        console.error("Error switching organization:", error)
        return {
          failure: {
            reason: "Error cambiando de organización"
          }
        }
      }
    }
  )

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
        refresh() // Refresh the current route to show the new member
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
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await auth.api.removeMember({
        body: {
          memberIdOrEmail: id
        },
        headers: await headers()
      })

      if (!data) {
        return {
          failure: {
            reason: "No se pudo eliminar al miembro"
          }
        }
      }

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
