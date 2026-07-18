"use server"

import { updateTag } from "next/cache"
import { z } from "zod/v4"

import {
  MISSING_ORGANIZATION_REASON,
  NOT_FOUND_OR_UNAUTHORIZED_REASON
} from "@/server/actions/tenant-guards"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import { hoursSchema, locationSchema } from "@/lib/types/location"

/**
 * Creates a location with the provided information.
 *
 * @param name - The name of the location.
 * @param description - The description of the location.
 * @param address - The address of the location.
 * @param phone - The phone number of the location.
 * @param facebook - The Facebook handle of the location.
 * @param instagram - The Instagram handle of the location.
 * @param twitter - The Twitter handle of the location.
 * @param tiktok - The TikTok handle of the location.
 * @param whatsapp - The WhatsApp number of the location.
 * @returns An object with either a success property containing the created location, or a failure property containing the reason for failure.
 */
export const createLocation = authMemberActionClient
  .inputSchema(locationSchema)
  .action(
    async ({
      parsedInput: {
        name,
        description,
        address,
        phone,
        facebook,
        instagram,
        twitter,
        tiktok,
        whatsapp,
        serviceDelivery,
        serviceTakeout,
        serviceDineIn,
        deliveryFee,
        currency
      },
      ctx: { member }
    }) => {
      try {
        const organizationId = member.organizationId

        if (!organizationId) {
          return {
            failure: {
              reason: "No se pudo obtener la organización actual"
            }
          }
        }

        const location = await prisma.location.create({
          data: {
            name,
            description,
            address,
            phone,
            facebook,
            instagram,
            twitter,
            tiktok,
            whatsapp,
            serviceDelivery,
            serviceTakeout,
            serviceDineIn,
            deliveryFee,
            currency,
            organization: {
              connect: {
                id: organizationId
              }
            }
          }
        })

        updateTag(`locations-${organizationId}`)
        return { success: location }
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
 * Updates the location with the provided information.
 *
 * @param id - The ID of the location to update.
 * @param name - The new name of the location.
 * @param description - The new description of the location.
 * @param address - The new address of the location.
 * @param phone - The new phone number of the location.
 * @param facebook - The new Facebook handle of the location.
 * @param instagram - The new Instagram handle of the location.
 * @param twitter - The new Twitter handle of the location.
 * @param tiktok - The new TikTok handle of the location.
 * @param whatsapp - The new WhatsApp number of the location.
 * @returns An object with the updated location if successful, or an object with the failure reason if an error occurs.
 */
export const updateLocation = authMemberActionClient
  .inputSchema(locationSchema)
  .action(
    async ({
      parsedInput: {
        id,
        name,
        description,
        address,
        phone,
        facebook,
        instagram,
        twitter,
        tiktok,
        whatsapp,
        serviceDelivery,
        serviceTakeout,
        serviceDineIn,
        deliveryFee,
        currency
      },
      ctx: { member }
    }) => {
      try {
        const organizationId = member.organizationId
        if (!organizationId) {
          return {
            failure: {
              reason: MISSING_ORGANIZATION_REASON
            }
          }
        }

        if (!id) {
          return {
            failure: {
              reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
            }
          }
        }

        const existingLocation = await prisma.location.findFirst({
          where: { id, organizationId },
          select: { id: true }
        })

        if (!existingLocation) {
          return {
            failure: {
              reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
            }
          }
        }

        const location = await prisma.location.update({
          where: {
            id
          },
          data: {
            name,
            description,
            address,
            phone,
            facebook,
            instagram,
            twitter,
            tiktok,
            whatsapp,
            serviceDelivery,
            serviceTakeout,
            serviceDineIn,
            deliveryFee,
            currency
          }
        })

        updateTag(`locations-${organizationId}`)
        return { success: location }
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
 * Deletes a location.
 *
 * @param id - The ID of the location to delete.
 * @returns A promise that resolves to an object with a `success` property if the deletion is successful, or a `failure` property with a `reason` if an error occurs.
 */
export const deleteLocation = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id }, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) {
      return {
        failure: {
          reason: MISSING_ORGANIZATION_REASON
        }
      }
    }

    try {
      const location = await prisma.location.findFirst({
        where: { id, organizationId },
        select: { id: true }
      })

      if (!location) {
        return {
          failure: {
            reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
          }
        }
      }

      await prisma.location.delete({
        where: {
          id
        }
      })

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
 * Updates the opening hours for a location.
 *
 * @param {Object} input - The input parameters.
 * @param {string} input.locationId - The ID of the location.
 * @param {Array<Object>} input.items - An array of objects representing the opening hours for each day.
 * @param {string} input.items.day - The day of the week.
 * @param {string} input.items.startTime - The start time of the opening hours.
 * @param {string} input.items.endTime - The end time of the opening hours.
 * @param {boolean} input.items.allDay - Indicates if the location is open all day.
 * @returns {Promise<Object>} - A promise that resolves to an object with the updated opening hours or a failure reason.
 */
export const updateHours = authMemberActionClient
  .inputSchema(hoursSchema)
  .action(async ({ parsedInput: { locationId, items }, ctx: { member } }) => {
    if (!locationId) {
      return {
        failure: {
          reason:
            "No has creado una sucursal. Por favor, cree una sucursal antes de agregar horarios."
        }
      }
    }

    // Get current orgization ID
    const organizationId = member.organizationId
    if (!organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    try {
      const location = await prisma.location.findFirst({
        where: { id: locationId, organizationId },
        select: { id: true }
      })

      if (!location) {
        return {
          failure: {
            reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
          }
        }
      }

      const hours = await prisma.$transaction(async tx => {
        await tx.openingHours.deleteMany({
          where: {
            locationId
          }
        })

        return tx.openingHours.createMany({
          data: items.map(item => ({
            locationId,
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            allDay: item.allDay
          }))
        })
      })

      updateTag(`locations-${organizationId}`)
      return { success: hours }
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
