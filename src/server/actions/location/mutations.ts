"use server"

import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { action } from "@/lib/safe-actions"
import { hoursSchema, locationSchema } from "@/lib/types"

export const createLocation = action(
  locationSchema,
  async ({
    name,
    description,
    address,
    phone,
    facebook,
    instagram,
    twitter,
    tiktok,
    whatsapp
  }) => {
    try {
      const currentOrg = cookies().get(appConfig.cookieOrg)?.value

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
              id: currentOrg
            }
          }
        }
      })

      revalidateTag(`default-location-${currentOrg}`)

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

export const updateLocation = action(
  locationSchema,
  async ({
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

export const deleteLocation = action(locationSchema, async ({ id }) => {
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

export const updateHours = action(
  hoursSchema,
  async ({ locationId, items }) => {
    if (!locationId) {
      return {
        failure: {
          reason: "No se pudo obtener la ubicación actual"
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

      revalidateTag(`default-location-${locationId}`)

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
  }
)
