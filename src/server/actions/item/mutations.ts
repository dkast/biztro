"use server"

import { Prisma } from "@prisma/client"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { action } from "@/lib/safe-actions"
import { menuItemSchema } from "@/lib/types"

/**
 * Creates a new item in the menu.
 *
 * @param {menuItemSchema} itemData - The data for the new item.
 * @returns {Promise<{ success: menuItemSchema } | { failure: { reason: string } }>} - A promise that resolves to an object with either a success or failure property.
 */
export const createItem = action(
  menuItemSchema,
  async ({ name, description, image, categoryId }) => {
    const currentOrg = cookies().get(appConfig.cookieOrg)?.value

    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    try {
      const item = await prisma.menuItem.create({
        data: {
          name,
          description,
          image,
          categoryId,
          organizationId: currentOrg
        }
      })

      return { success: item }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error)
        if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
          message = "Ya existe un producto con ese nombre"
        } else {
          message = error.message
        }
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
