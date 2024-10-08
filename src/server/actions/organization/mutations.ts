"use server"

import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { z } from "zod"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { actionClient, authActionClient } from "@/lib/safe-actions"
import { MembershipRole, orgSchema } from "@/lib/types"

/**
 * Bootstrap an organization by creating a new organization with the provided name, description, and subdomain.
 *
 * @param name - The name of the organization.
 * @param description - The description of the organization.
 * @param subdomain - The subdomain of the organization.
 * @returns An object indicating the success or failure of the operation.
 */
export const bootstrapOrg = authActionClient
  .schema(orgSchema)
  .action(
    async ({
      parsedInput: { name, description, subdomain },
      ctx: { user }
    }) => {
      try {
        if (user?.id === undefined) {
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
            role: MembershipRole.OWNER
          }
        })

        // Set the current organization
        cookies().set(appConfig.cookieOrg, org.id, {
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
  .schema(orgSchema)
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
  .schema(orgSchema)
  .action(async ({ parsedInput: { id, name, description, subdomain } }) => {
    try {
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
  .schema(
    z.object({
      email: z.string().email()
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
