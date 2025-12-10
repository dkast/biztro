"use server"

import { Prisma } from "@/generated/prisma-client/client"
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { updateTag } from "next/cache"
import { z } from "zod/v4"

import { getItemCount } from "@/server/actions/item/queries"
import { isProMember } from "@/server/actions/user/queries"
import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
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
export const createItem = authMemberActionClient
  .inputSchema(menuItemSchema)
  .action(
    async ({
      parsedInput: {
        name,
        description,
        status,
        image,
        categoryId,
        variants,
        featured,
        allergens,
        currency
      },
      ctx: { member }
    }) => {
      const currentOrgId = member.organizationId

      if (!currentOrgId) {
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
          organizationId: currentOrgId
        }
      })

      // If the item already exists, generate a new name for it assigning a unique suffix
      if (existingItem) {
        let suffix = 1
        let candidateName = `${name} (copia)`

        // Check if the name with "copia" suffix already exists
        let nameExists = await prisma.menuItem.findFirst({
          where: {
            name: candidateName,
            organizationId: currentOrgId
          }
        })

        // If it exists, try incrementing numbers until we find an available name
        while (nameExists) {
          suffix++
          candidateName = `${name} (copia ${suffix})`
          nameExists = await prisma.menuItem.findFirst({
            where: {
              name: candidateName,
              organizationId: currentOrgId
            }
          })
        }

        name = candidateName
      }

      try {
        const item = await prisma.menuItem.create({
          data: {
            name,
            description,
            status,
            image,
            categoryId: categoryId === "" ? null : categoryId,
            featured,
            allergens,
            currency: currency ?? "MXN",
            organizationId: currentOrgId,
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

        updateTag(`menu-items-${currentOrgId}`)
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
export const bulkCreateItems = authMemberActionClient
  .inputSchema(bulkMenuItemSchema)
  .action(async ({ parsedInput: items, ctx: { member } }) => {
    const currentOrgId = member.organizationId

    if (!currentOrgId) {
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
      const createdItems = await prisma.$transaction(async tx => {
        // First, fetch all existing categories for the organization
        const existingCategories = await tx.category.findMany({
          where: {
            organizationId: currentOrgId
          }
        })

        // Create a map of lowercase category names to their IDs
        const categoryMap = new Map(
          existingCategories.map(cat => [cat.name.toLowerCase(), cat.id])
        )

        // Track new categories to be created
        const newCategoryNames = new Set<string>()

        // First pass - collect unique new categories
        items.forEach(item => {
          if (item.category) {
            const normalizedName = item.category.trim()
            if (!categoryMap.has(normalizedName.toLowerCase())) {
              newCategoryNames.add(normalizedName)
            }
          }
        })

        // Bulk create new categories
        await tx.category.createMany({
          data: Array.from(newCategoryNames).map(name => ({
            name,
            organizationId: currentOrgId
          }))
        })

        // Refresh category map with new categories
        const updatedCategories = await tx.category.findMany({
          where: {
            organizationId: currentOrgId
          }
        })
        const updatedCategoryMap = new Map(
          updatedCategories.map(cat => [cat.name.toLowerCase(), cat.id])
        )

        return Promise.all(
          items.map(item => {
            let categoryId = undefined

            if (item.category) {
              const normalizedName = item.category.trim()
              categoryId = updatedCategoryMap.get(normalizedName.toLowerCase())
            }

            return tx.menuItem.create({
              data: {
                name: item.name,
                description: item.description || "",
                status: item.status || MenuItemStatus.ACTIVE,
                categoryId,
                currency: item.currency
                  ? (item.currency as "MXN" | "USD")
                  : "MXN",
                organizationId: currentOrgId,
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
          })
        )
      })

      updateTag(`menu-items-${currentOrgId}`)
      updateTag(`categories-${currentOrgId}`)
      return { success: createdItems }
    } catch (error) {
      // Add type checking for better error handling
      if (error instanceof Error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case "P2002":
              return { failure: { reason: "Entrada duplicada" } }
            case "P2003":
              return { failure: { reason: "Referencia invalidad" } }
            default:
              return {
                failure: {
                  reason: `Error: Verifique que productos no estén duplicados. ${error.code}`
                }
              }
          }
        }
      } else {
        return { failure: { reason: "Error desconocido" } }
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
export const updateItem = authMemberActionClient
  .inputSchema(menuItemSchema)
  .action(
    async ({
      parsedInput: {
        id,
        name,
        description,
        status,
        categoryId,
        organizationId,
        variants,
        featured,
        allergens,
        currency
      }
    }) => {
      try {
        const item = await prisma.menuItem.update({
          where: { id },
          data: {
            name,
            description,
            status,
            currency: currency ?? "MXN",
            categoryId: categoryId === "" ? null : categoryId,
            featured,
            allergens,
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

        updateTag(`menu-items-${organizationId}`)
        updateTag(`menu-item-${id}`)
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
export const deleteItem = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      organizationId: z.string()
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
            Key: item.image || undefined
          })
        )
      }
      await prisma.menuItem.delete({
        where: { id }
      })

      updateTag(`menu-items-${organizationId}`)
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
export const createCategory = authMemberActionClient
  .inputSchema(categorySchema)
  .action(async ({ parsedInput: { name }, ctx: { member } }) => {
    const currentOrgId = member.organizationId
    if (!currentOrgId) {
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
          organizationId: currentOrgId
        }
      })

      updateTag(`categories-${currentOrgId}`)
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
export const updateCategory = authMemberActionClient
  .inputSchema(categorySchema)
  .action(async ({ parsedInput: { id, name, organizationId } }) => {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name
        }
      })

      updateTag(`categories-${organizationId}`)
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
export const deleteCategory = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { id, organizationId } }) => {
    // const currentOrgId = member.organizationId
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

      updateTag(`categories-${organizationId}`)
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
export const createVariant = authMemberActionClient
  .inputSchema(variantSchema)
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

      updateTag(`menu-item-${menuItemId}`)
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
export const deleteVariant = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      menuItemId: z.string()
    })
  )
  .action(async ({ parsedInput: { id, menuItemId } }) => {
    try {
      await prisma.variant.delete({
        where: { id }
      })

      updateTag(`menu-item-${menuItemId}`)
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
 * Updates the category of multiple items at once.
 */
export const bulkUpdateCategory = authMemberActionClient
  .inputSchema(
    z.object({
      ids: z.array(z.string()),
      categoryId: z.string(),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { ids, categoryId, organizationId } }) => {
    try {
      await prisma.menuItem.updateMany({
        where: {
          id: { in: ids }
        },
        data: {
          categoryId
        }
      })

      updateTag(`menu-items-${organizationId}`)
      return { success: true }
    } catch (error) {
      console.error(error)
      return {
        failure: {
          reason: "Error al actualizar las categorías"
        }
      }
    }
  })

/**
 * Deletes multiple items at once.
 */
export const bulkDeleteItems = authMemberActionClient
  .inputSchema(
    z.object({
      ids: z.array(z.string()),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { ids, organizationId } }) => {
    try {
      // First get all items to delete their images
      const items = await prisma.menuItem.findMany({
        where: { id: { in: ids } }
      })

      // Delete images from storage if they exist
      await Promise.all(
        items
          .filter(item => item.image)
          .map(item =>
            R2.send(
              new DeleteObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: item.image || undefined
              })
            )
          )
      )

      // Delete all items
      await prisma.menuItem.deleteMany({
        where: {
          id: { in: ids }
        }
      })

      updateTag(`menu-items-${organizationId}`)
      return { success: true }
    } catch (error) {
      console.error(error)
      return {
        failure: {
          reason: "Error al eliminar los productos"
        }
      }
    }
  })

/**
 * Toggles the featured status of multiple items at once.
 */
export const bulkToggleFeature = authMemberActionClient
  .inputSchema(
    z.object({
      ids: z.array(z.string()),
      featured: z.boolean(),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { ids, featured, organizationId } }) => {
    try {
      await prisma.menuItem.updateMany({
        where: {
          id: { in: ids }
        },
        data: {
          featured
        }
      })

      updateTag(`menu-items-${organizationId}`)
      return { success: true }
    } catch (error) {
      console.error(error)
      return {
        failure: {
          reason: "Error al actualizar los productos destacados"
        }
      }
    }
  })
