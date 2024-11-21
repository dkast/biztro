"use server"

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { Prisma } from "@prisma/client"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { z } from "zod"

import { appConfig } from "@/app/config"
import { getItemCount } from "@/server/actions/item/queries"
import { isProMember } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { authActionClient } from "@/lib/safe-actions"
import {
  BasicPlanLimits,
  bulkMenuItemSchema,
  categorySchema,
  menuItemSchema,
  MenuItemStatus,
  variantSchema
} from "@/lib/types"
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
export const createItem = authActionClient
  .schema(menuItemSchema)
  .action(
    async ({
      parsedInput: { name, description, status, image, categoryId, variants }
    }) => {
      const currentOrg = (await cookies()).get(appConfig.cookieOrg)?.value

      if (!currentOrg) {
        return {
          failure: {
            reason: "No se pudo obtener la organización actual"
          }
        }
      }

      const proMember = await isProMember()
      const itemCount = await getItemCount()

      const itemLimit = appConfig.itemLimit || 10
      if (!proMember && itemCount >= itemLimit) {
        return {
          failure: {
            reason:
              "Límite de 10 productos alcanzado. Actualiza a Pro para crear más.",
            code: BasicPlanLimits.ITEM_LIMIT_REACHED
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
            status,
            image,
            categoryId,
            organizationId: currentOrg,
            variants: {
              create: [
                {
                  name: variants[0].name,
                  price: variants[0].price
                }
              ]
            }
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

/**
 * Creates multiple items in bulk.
 */
export const bulkCreateItems = authActionClient
  .schema(bulkMenuItemSchema)
  .action(async ({ parsedInput: items }) => {
    const currentOrg = (await cookies()).get(appConfig.cookieOrg)?.value

    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    const proMember = await isProMember()
    const itemCount = await getItemCount()

    const itemLimit = appConfig.itemLimit || 10
    if (!proMember && itemCount + items.length > itemLimit) {
      return {
        failure: {
          reason:
            "Excederías el límite de productos permitidos en el plan básico",
          code: BasicPlanLimits.ITEM_LIMIT_REACHED
        }
      }
    }

    try {
      const createdItems = await prisma.$transaction(
        items.map(item =>
          prisma.menuItem.create({
            data: {
              name: item.name,
              description: item.description || "",
              status: item.status || MenuItemStatus.ACTIVE,
              organizationId: currentOrg,
              variants: {
                create: [
                  {
                    name: "Regular",
                    price: item.price
                  }
                ]
              }
            }
          })
        )
      )

      revalidateTag(`menuItems-${currentOrg}`)
      return { success: createdItems }
    } catch (error) {
      console.error(error)
      return {
        failure: {
          reason: "Error al crear los productos en masa"
        }
      }
    }
  })

/**
 * Updates an item.
 *
 * @param id - The ID of the item to update.
 * @param name - The new name of the item.
 * @param description - The new description of the item.
 * @param status - The new status of the item.
 * @param categoryId - The new category ID of the item.
 * @param organizationId - The ID of the organization the item belongs to.
 * @param variants - An array of variants to update or create.
 * @returns An object with the updated item on success, or a failure object with a reason on failure.
 */
export const updateItem = authActionClient
  .schema(menuItemSchema)
  .action(
    async ({
      parsedInput: {
        id,
        name,
        description,
        status,
        categoryId,
        organizationId,
        variants
      }
    }) => {
      try {
        const item = await prisma.menuItem.update({
          where: { id },
          data: {
            name,
            description,
            status,
            categoryId,
            variants: {
              upsert: variants.map(variant => ({
                where: { id: variant.id },
                create: {
                  name: variant.name,
                  price: variant.price
                },
                update: {
                  name: variant.name,
                  price: variant.price
                }
              }))
            }
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

/**
 * Deletes an item from the server.
 *
 * @param id - The ID of the item to be deleted.
 * @param organizationId - The ID of the organization the item belongs to.
 * @returns An object indicating the success or failure of the deletion operation.
 */
export const deleteItem = authActionClient
  .schema(
    z.object({
      id: z.string().cuid(),
      organizationId: z.string().cuid()
    })
  )
  .action(async ({ parsedInput: { id, organizationId } }) => {
    try {
      // Delete the image from the storage if exists
      const item = await prisma.menuItem.findUnique({
        where: { id }
      })

      if (item?.image) {
        // Delete the image from the storage
        await R2.send(
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
  })

/**
 * Creates a new category.
 *
 * @param name - The name of the category.
 * @returns An object with either a success property containing the created category, or a failure property containing the reason for failure.
 */
export const createCategory = authActionClient
  .schema(categorySchema)
  .action(async ({ parsedInput: { name } }) => {
    const currentOrg = (await cookies()).get(appConfig.cookieOrg)?.value

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

      // revalidateTag(`categories-${currentOrg}`)

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

/**
 * Updates a category.
 *
 * @param id - The ID of the category to update.
 * @param name - The new name for the category.
 * @param organizationId - The ID of the organization the category belongs to.
 * @returns An object with the updated category if successful, or a failure object with a reason if an error occurs.
 */
export const updateCategory = authActionClient
  .schema(categorySchema)
  .action(async ({ parsedInput: { id, name, organizationId } }) => {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name
        }
      })

      revalidateTag(`categories-${organizationId}`)

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

/**
 * Deletes a category.
 *
 * @param {string} id - The ID of the category to delete.
 * @param {string} organizationId - The ID of the organization the category belongs to.
 * @returns {Promise<{ success: boolean } | { failure: { reason: string } }>} - A promise that resolves to an object indicating the success or failure of the deletion operation.
 */
export const deleteCategory = authActionClient
  .schema(
    z.object({
      id: z.string().cuid(),
      organizationId: z.string().cuid()
    })
  )
  .action(async ({ parsedInput: { id, organizationId } }) => {
    try {
      // Check if the category is being used by any item
      const items = await prisma.menuItem.findMany({
        where: { categoryId: id }
      })

      if (items.length > 0) {
        return {
          failure: {
            reason:
              "No se puede eliminar una categoría que tiene productos asociados"
          }
        }
      }

      await prisma.category.delete({
        where: { id }
      })

      revalidateTag(`categories-${organizationId}`)

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
  })

/**
 * Creates a variant for a menu item.
 *
 * @param name - The name of the variant.
 * @param price - The price of the variant.
 * @param menuItemId - The ID of the associated menu item.
 * @returns An object with either a success property containing the created variant, or a failure property containing the reason for failure.
 */
export const createVariant = authActionClient
  .schema(variantSchema)
  .action(async ({ parsedInput: { name, price, menuItemId } }) => {
    if (!menuItemId) {
      return {
        failure: {
          reason: "No se pudo obtener el producto asociado"
        }
      }
    }

    try {
      const variant = await prisma.variant.create({
        data: {
          name,
          price,
          menuItemId
        }
      })

      // revalidateTag(`variants-${menuItemId}`)
      revalidateTag(`menuItem-${menuItemId}`)

      return { success: variant }
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
  })

/**
 * Deletes a variant.
 *
 * @param {string} id - The ID of the variant to delete.
 * @param {string} menuItemId - The ID of the menu item associated with the variant.
 * @returns {Promise<{ success: boolean } | { failure: { reason: string } }>} - A promise that resolves to an object indicating the success or failure of the deletion operation.
 */
export const deleteVariant = authActionClient
  .schema(
    z.object({
      id: z.string().cuid(),
      menuItemId: z.string().cuid()
    })
  )
  .action(async ({ parsedInput: { id, menuItemId } }) => {
    try {
      await prisma.variant.delete({
        where: { id }
      })

      // revalidateTag(`variants-${menuItemId}`)
      revalidateTag(`menuItem-${menuItemId}`)

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
  })
