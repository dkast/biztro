"use server"

import { revalidateTag } from "next/cache"

import { getCurrentOrganization } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { authActionClient } from "@/lib/safe-actions"
import { hoursSchema, locationSchema } from "@/lib/types"

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
export const createLocation = authActionClient
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
        whatsapp
      }
    }) => {
      try {
        const currentOrg = await getCurrentOrganization()

        if (!currentOrg) {
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
            organization: {
              connect: {
                id: currentOrg.id
              }
            }
          }
        })

        revalidateTag(`default-location-${currentOrg.id}`)

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
export const updateLocation = authActionClient
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
        whatsapp
      }
    }) => {
      try {
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
            whatsapp
          }
        })

        revalidateTag(`default-location-${id}`)

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
export const deleteLocation = authActionClient
  .inputSchema(locationSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      await prisma.location.delete({
        where: {
          id
        }
      })

      revalidateTag(`default-location-${id}`)

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
export const updateHours = authActionClient
  .inputSchema(hoursSchema)
  .action(async ({ parsedInput: { locationId, items } }) => {
    if (!locationId) {
      return {
        failure: {
          reason:
            "No has creado una sucursal. Por favor, cree una sucursal antes de agregar horarios."
        }
      }
    }

    // Get current orgization ID
    const currentOrg = await getCurrentOrganization()
    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    try {
      await prisma.openingHours.deleteMany({
        where: {
          locationId
        }
      })

      const hours = await prisma.openingHours.createMany({
        data: items.map(item => ({
          locationId: locationId,
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          allDay: item.allDay
        }))
      })

      revalidateTag(`default-location-${currentOrg.id}`)

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
