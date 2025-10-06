"use server"

import { he } from "date-fns/locale"
import { revalidateTag } from "next/cache"
import { cookies, headers } from "next/headers"
import { z } from "zod/v4"

import { getCurrentSubscription } from "@/server/actions/subscriptions/queries"
import { appConfig } from "@/app/config"
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

        console.log("Checking existing organization slug:", slug, existingOrg)

        if (!existingOrg.status) {
          return {
            failure: {
              reason: "El subdominio ya está en uso"
            }
          }
        }

        // Create the organization
        console.log("Creating organization:", { name, slug, userId: user.id })
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

        revalidateTag(`organization-${org.id}`)
        revalidateTag(`organization-${org.slug}`)
        revalidateTag(`memberships-${org.id}`)

        return { success: true }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Error) {
          message = error.message
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

        revalidateTag(`organization-${org.id}`)
        revalidateTag(`organization-${org.slug}`)
        revalidateTag(`memberships-${org.id}`)

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
          const maybeOrg = await auth.api
            .getFullOrganization({
              query: { organizationSlug: slug },
              headers: await headers()
            })
            .catch(() => null)

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

      revalidateTag(`organization-${id}`)
      revalidateTag(`organization-${org.slug}`)

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
      const invite = await prisma.invite.findUnique({
        where: {
          email: email
        }
      })

      if (invite) {
        throw new Error("Ya estás en la lista de espera")
      }

      await prisma.invite.create({
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

// TODO: Implement deleteOrganization action once Subscription Plugin is ready
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

        console.log("Deleted organization:", deleted)
        if (!deleted) {
          return {
            failure: {
              reason: "No se pudo eliminar la organización"
            }
          }
        }

        revalidateTag(`organization-${id}`)
        revalidateTag(`memberships-${id}`)

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
