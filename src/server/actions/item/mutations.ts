"use server"

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { Prisma } from "@prisma/client"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { z } from "zod"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { action } from "@/lib/safe-actions"
import { categorySchema, menuItemSchema } from "@/lib/types"
import { env } from "@/env.mjs"

// Create an Cloudflare R2 service client object
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_KEY_ID
  }
})

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

    // Find if the item already exists
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name,
        organizationId: currentOrg
      }
    })

    // If the item already exists, generate a new name for it
    name = existingItem ? `${name} (2)` : name

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

      revalidateTag(`menuItems-${currentOrg}`)
      revalidateTag(`menuItem-${item.id}`)

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

export const updateItem = action(
  menuItemSchema,
  async ({ id, name, description, image, categoryId, organizationId }) => {
    try {
      const item = await prisma.menuItem.update({
        where: { id },
        data: {
          name,
          description,
          image,
          categoryId
        }
      })

      revalidateTag(`menuItems-${organizationId}`)
      revalidateTag(`menuItem-${item.id}`)

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

export const deleteItem = action(
  z.object({
    id: z.string().cuid(),
    organizationId: z.string().cuid()
  }),
  async ({ id, organizationId }) => {
    try {
      // Delete the image from the storage if exists
      const item = await prisma.menuItem.findUnique({
        where: { id }
      })

      if (item?.image) {
        // Delete the image from the storage
        const deleted = await R2.send(
          new DeleteObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: item.image
          })
        )
      }
      await prisma.menuItem.delete({
        where: { id }
      })

      revalidateTag(`menuItems-${organizationId}`)
      revalidateTag(`menuItem-${id}`)

      return { success: true }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error)
        message = error.message
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

export const createCategory = action(categorySchema, async ({ name }) => {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value

  if (!currentOrg) {
    return {
      failure: {
        reason: "No se pudo obtener la organización actual"
      }
    }
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        organizationId: currentOrg
      }
    })

    revalidateTag(`categories-${currentOrg}`)

    return { success: category }
  } catch (error) {
    let message
    if (typeof error === "string") {
      message = error
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error)
      if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
        message = "Ya existe una categoría con ese nombre"
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
})
