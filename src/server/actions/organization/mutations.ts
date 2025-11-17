"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod/v4"

import { getOrganizationBySlug } from "@/server/actions/organization/queries"
import { getCurrentSubscription } from "@/server/actions/subscriptions/queries"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { actionClient, authActionClient } from "@/lib/safe-actions"
import { orgSchema } from "@/lib/types"

/**
 * Bootstrap an organization by creating a new organization with the provided name, description, and subdomain.
 *
 * @param name - The name of the organization.
 * @param description - The description of the organization.
 * @param slug - The slug of the organization.
 * @returns An object indicating the success or failure of the operation.
 */
export const bootstrapOrg = authActionClient
  .inputSchema(orgSchema)
  .action(
    async ({ parsedInput: { name, description, slug }, ctx: { user } }) => {
      try {
        if (user?.id === undefined) {
          return {
            failure: {
              reason: "No se pudo obtener el usuario actual"
            }
          }
        }

        // Verify if the slug is already taken
        const existingOrg = await auth.api.checkOrganizationSlug({
          body: { slug },
          headers: await headers()
        })

        if (!existingOrg.status) {
          return {
            failure: {
              reason: "El subdominio ya está en uso"
            }
          }
        }

        // Create the organization
        const org = await auth.api.createOrganization({
          body: {
            name,
            slug,
            keepCurrentActiveOrganization: true,
            userId: user.id,
            description,
            status: "ACTIVE",
            plan: "BASIC",
            banner: ""
          },
          headers: await headers()
        })

        if (!org) {
          return {
            failure: {
              reason: "No se pudo crear la organización"
            }
          }
        }

        // Set the new organization as the active one
        const data = await auth.api.setActiveOrganization({
          body: { organizationId: org.id },
          headers: await headers()
        })

        if (!data) {
          return {
            failure: {
              reason: "No se pudo establecer la organización activa"
            }
          }
        }

        updateTag("organizations-list")
        updateTag("organization-current")
        updateTag("membership-current")
        updateTag("membership-current-role")
        updateTag("permissions-all")
        updateTag("page-settings")
        updateTag("page-settings-members")
        if (org?.id) {
          updateTag(`organization-${org.id}`)
          updateTag(`organization-${org.id}-members`)
          updateTag(`organization-${org.id}-subscription`)
        }
        updateTag(`subscription-current`)

        return { success: true }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Error) {
          message = error.message
          if (message.includes("slug")) {
            message = "El subdominio ya está en uso"
          }
        }
        console.error("Error bootstrapping organization:", error)
        return {
          failure: {
            reason: message
          }
        }
      }
    }
  )

/**
 * Creates a new organization.
 *
 * @param name - The name of the organization.
 * @param description - The description of the organization.
 * @param slug - The slug of the organization.
 * @returns An object indicating the success or failure of the operation.
 */
export const createOrg = authActionClient
  .inputSchema(orgSchema)
  .action(
    async ({ parsedInput: { name, description, slug }, ctx: { user } }) => {
      try {
        if (user?.id === undefined) {
          return {
            failure: {
              reason: "No se pudo obtener el usuario actual"
            }
          }
        }
        if (!slug) {
          return {
            failure: {
              reason: "Subdominio es requerido"
            }
          }
        }

        // Verify if the slug is already taken via Better Auth
        const existingOrg = await auth.api.checkOrganizationSlug({
          body: { slug },
          headers: await headers()
        })

        if (!existingOrg.status) {
          return {
            failure: {
              reason: "El subdominio ya está en uso"
            }
          }
        }

        // Create organization through Better Auth server API
        const org = await auth.api.createOrganization({
          body: {
            name,
            slug,
            keepCurrentActiveOrganization: true,
            userId: user.id,
            description,
            status: "ACTIVE",
            plan: "BASIC",
            banner: ""
          },
          headers: await headers()
        })

        if (!org) {
          return {
            failure: {
              reason: "No se pudo crear la organización"
            }
          }
        }

        updateTag("organizations-list")
        if (org.id) {
          updateTag(`organization-${org.id}`)
          updateTag(`organization-${org.id}-members`)
          updateTag(`organization-${org.id}-subscription`)
        }

        return { success: true }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Error) {
          message = error.message
        }
        console.error("Error creating organization via Better Auth:", error)
        return {
          failure: {
            reason: message
          }
        }
      }
    }
  )

/**
 * Updates an organization.
 *
 * @param id - The ID of the organization to update.
 * @param name - The new name of the organization.
 * @param description - The new description of the organization.
 * @param slug - The new slug of the organization.
 * @returns An object indicating the success or failure of the update operation.
 */
export const updateOrg = authActionClient
  .inputSchema(orgSchema)
  .action(async ({ parsedInput: { id, name, description, slug } }) => {
    try {
      if (!id) {
        return {
          failure: {
            reason: "ID de organización es requerido"
          }
        }
      }
      // Verify if the slug is already taken using Better Auth server API
      if (slug) {
        let existingSlug: { status?: boolean } | null = null
        try {
          existingSlug = await auth.api.checkOrganizationSlug({
            body: { slug },
            headers: await headers()
          })
        } catch (err) {
          // If the external API throws (for example, when slug is taken),
          // don't return early — treat as 'not available' and verify ownership below.
          console.warn("checkOrganizationSlug failed:", err)
          existingSlug = null
        }

        // checkOrganizationSlug returns status: true when available
        if (!existingSlug?.status) {
          // If slug appears taken or check failed, verify it's not taken by this same org
          const maybeOrg = await getOrganizationBySlug(slug)

          if (maybeOrg && maybeOrg.id !== id) {
            throw new Error("El subdominio ya está en uso")
          }
        }
      }

      // Update organization using Better Auth server API
      const org = await auth.api.updateOrganization({
        body: {
          data: {
            name,
            slug,
            description
          },
          organizationId: id as string
        },
        headers: await headers()
      })

      if (!org) {
        return {
          failure: {
            reason: "No se pudo actualizar la organización"
          }
        }
      }

      updateTag("organizations-list")
      updateTag("organization-current")
      updateTag("page-settings")
      updateTag("page-settings-members")
      updateTag("subscription-current")
      updateTag("permissions-all")
      updateTag("membership-current")
      updateTag("membership-current-role")
      updateTag(`organization-${id}`)
      updateTag(`organization-${id}-members`)
      updateTag(`organization-${id}-subscription`)

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
  })

/**
 * Join the waitlist with the provided email.
 *
 * @param {string} email - The email to join the waitlist with.
 * @returns {Promise<{ success: { email: string } } | { failure: { reason: string } }>} - A promise that resolves to an object indicating the success or failure of joining the waitlist.
 */
export const joinWaitlist = actionClient
  .inputSchema(
    z.object({
      email: z.email()
    })
  )
  .action(async ({ parsedInput: { email } }) => {
    try {
      const waitlist = await prisma.waitlist.findUnique({
        where: {
          email: email
        }
      })

      if (waitlist) {
        throw new Error("Ya estás en la lista de espera")
      }

      await prisma.waitlist.create({
        data: {
          email: email
        }
      })

      return {
        success: {
          email: email
        }
      }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Error) {
        message = error.message
      } else {
        message = "Unknown error"
      }
      return {
        failure: {
          reason: message
        }
      }
    }
  })

export const deleteOrganization = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    // Delete organization
    try {
      const subscription = await getCurrentSubscription(id)
      if (
        subscription &&
        (subscription.status === "active" || subscription.status === "trialing")
      ) {
        return {
          failure: {
            reason:
              "No se puede eliminar una organización con una suscripción activa"
          }
        }
      } else {
        // Delete organization through Better Auth server API and revalidate cache
        const deleted = await auth.api.deleteOrganization({
          body: { organizationId: id },
          headers: await headers()
        })

        if (!deleted) {
          return {
            failure: {
              reason: "No se pudo eliminar la organización"
            }
          }
        }

        updateTag("organizations-list")
        updateTag("organization-current")
        updateTag("membership-current")
        updateTag("membership-current-role")
        updateTag("permissions-all")
        updateTag("subscription-current")
        if (id) {
          updateTag(`organization-${id}`)
          updateTag(`organization-${id}-members`)
          updateTag(`organization-${id}-subscription`)
        }

        return {
          success: true
        }
      }
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
  })
