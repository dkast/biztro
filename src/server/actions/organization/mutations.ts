"use server"

import { revalidateTag } from "next/cache"
import { cookies, headers } from "next/headers"
import { z } from "zod/v4"

import { getCurrentSubscription } from "@/server/actions/subscriptions/queries"
import { appConfig } from "@/app/config"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { actionClient, authActionClient } from "@/lib/safe-actions"
import { MembershipRole, orgSchema } from "@/lib/types"

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
        const org = await auth.api.createOrganization({
          body: {
            name,
            description,
            slug
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

        // Set the organization
        await auth.api.setActiveOrganization({
          body: {
            organizationId: org.id,
            organizationSlug: org.slug
          }
        })

        const cookieStore = await cookies()

        cookieStore.set(appConfig.cookieOrg, org.id, {
          maxAge: 60 * 60 * 24 * 365
        })

        revalidateTag(`organization-${org.id}`)
        revalidateTag(`organization-${org.subdomain}`)
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

/**
 * Creates a new organization.
 *
 * @param name - The name of the organization.
 * @param description - The description of the organization.
 * @param subdomain - The subdomain of the organization.
 * @returns An object indicating the success or failure of the operation.
 */
export const createOrg = authActionClient
  .inputSchema(orgSchema)
  .action(async ({ parsedInput: { name, description, subdomain } }) => {
    try {
      const org = await prisma.organization.create({
        data: {
          name,
          description,
          subdomain
        }
      })

      revalidateTag(`organization-${org.id}`)
      revalidateTag(`organization-${org.subdomain}`)

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
 * Updates an organization.
 *
 * @param id - The ID of the organization to update.
 * @param name - The new name of the organization.
 * @param description - The new description of the organization.
 * @param subdomain - The new subdomain of the organization.
 * @returns An object indicating the success or failure of the update operation.
 */
export const updateOrg = authActionClient
  .inputSchema(orgSchema)
  .action(async ({ parsedInput: { id, name, description, subdomain } }) => {
    try {
      // Verify if the subdomain is already taken
      const existingOrg = await prisma.organization.findFirst({
        where: {
          subdomain
        }
      })

      if (existingOrg && existingOrg.id !== id) {
        throw new Error("El subdominio ya está en uso")
      }

      const org = await prisma.organization.update({
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
      revalidateTag(`organization-${org.subdomain}`)

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

export const deleteOrganization = authActionClient
  .inputSchema(
    z.object({
      id: z.cuid()
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
        // Remove cookie
        const cookieStore = await cookies()
        cookieStore.delete(appConfig.cookieOrg)

        // Delete organization and revalidate cache
        await prisma.organization.delete({
          where: {
            id
          }
        })

        revalidateTag(`organization-${id}`)

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
