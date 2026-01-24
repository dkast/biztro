"use server"

import { Prisma } from "@/generated/prisma-client/client"
import { updateTag } from "next/cache"
import { z } from "zod/v4"

import { getMenuCount } from "@/server/actions/menu/queries"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { authActionClient } from "@/lib/safe-actions"
import { BasicPlanLimits, menuSchema } from "@/lib/types"

/**
 * Creates a menu.
 *
 * @param name - The name of the menu.
 * @param description - The description of the menu.
 * @param status - The status of the menu.
 * @returns An object with either a success or failure property.
 *          - If successful, the success property contains the created menu.
 *          - If failed, the failure property contains the reason for the failure.
 */
export const createMenu = authActionClient
  .inputSchema(menuSchema)
  .action(async ({ parsedInput: { name, description, status } }) => {
    const currentOrg = await getCurrentOrganization()

    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    const proMember = await isProMember()
    const menuCount = await getMenuCount()

    const menuLimit = appConfig.menuLimit || 5
    if (!proMember && menuCount >= menuLimit) {
      return {
        failure: {
          reason: `Límite de ${menuLimit} menús alcanzado. Actualiza a Pro para crear más.`,
          code: BasicPlanLimits.MENU_LIMIT_REACHED
        }
      }
    }

    try {
      const menu = await prisma.menu.create({
        data: {
          name,
          description,
          status,
          organizationId: currentOrg.id
        }
      })

      updateTag(`menus-${currentOrg.id}`)
      return {
        success: menu
      }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
          message = "Conflict error"
        } else {
          message = "Database error"
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
 * Updates the name of a menu.
 *
 * @param id - The ID of the menu to update.
 * @param name - The new name for the menu.
 * @returns An object with the updated menu name, or a failure object with a reason if an error occurs.
 */
export const updateMenuName = authActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      name: z.string()
    })
  )
  .action(async ({ parsedInput: { id, name } }) => {
    try {
      const menu = await prisma.menu.update({
        where: { id },
        data: { name }
      })

      updateTag(`menus-${menu.organizationId}`)
      return {
        name: menu.name
      }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
          message = "Ya existe un menú con ese nombre"
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
 * Updates the status, font theme, color theme, and serial data of a menu.
 *
 * @param id - The ID of the menu.
 * @param subdomain - The subdomain of the site.
 * @param status - The status of the menu. Must be either "PUBLISHED" or "DRAFT".
 * @param fontTheme - The font theme of the menu.
 * @param colorTheme - The color theme of the menu.
 * @param serialData - The serial data of the menu.
 * @returns An object with the updated menu if successful, or an object with the failure reason if unsuccessful.
 */
export const updateMenuStatus = authActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      subdomain: z.string(),
      status: z.enum(["PUBLISHED", "DRAFT"]),
      fontTheme: z.string(),
      colorTheme: z.string(),
      serialData: z.string()
    })
  )
  .action(
    async ({
      parsedInput: { id, subdomain, status, fontTheme, colorTheme, serialData }
    }) => {
      try {
        const menu = await prisma.menu.update({
          where: { id },
          data:
            status === "PUBLISHED"
              ? {
                  status,
                  fontTheme,
                  colorTheme,
                  serialData,
                  publishedData: serialData,
                  publishedAt: new Date(),
                  publishedFontTheme: fontTheme,
                  publishedColorTheme: colorTheme
                }
              : {
                  status,
                  fontTheme,
                  colorTheme,
                  serialData,
                  publishedData: null,
                  publishedAt: null,
                  publishedFontTheme: null,
                  publishedColorTheme: null
                }
        })

        updateTag(`subdomain-${subdomain}`)
        updateTag(`menu-${menu.id}`)
        return {
          success: menu
        }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

/**
 * Updates the menu serial data.
 *
 * @param id - The ID of the menu.
 * @param fontTheme - The font theme of the menu.
 * @param colorTheme - The color theme of the menu.
 * @param serialData - The serial data of the menu.
 * @returns An object with the updated menu if successful, or an object with the failure reason if unsuccessful.
 */
export const updateMenuSerialData = authActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      fontTheme: z.string(),
      colorTheme: z.string(),
      serialData: z.string()
    })
  )
  .action(
    async ({ parsedInput: { id, fontTheme, colorTheme, serialData } }) => {
      try {
        const menu = await prisma.menu.update({
          where: { id },
          data: { fontTheme, colorTheme, serialData }
        })

        updateTag(`menu-${menu.id}`)
        return {
          success: menu
        }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export const revertMenuToPublished = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id },
        select: {
          publishedData: true,
          publishedFontTheme: true,
          publishedColorTheme: true,
          fontTheme: true,
          colorTheme: true
        }
      })

      if (!menu?.publishedData) {
        return {
          failure: {
            reason: "No hay una versión publicada para revertir."
          }
        }
      }

      const publishedFontTheme =
        menu.publishedFontTheme ?? menu.fontTheme ?? "DEFAULT"
      const publishedColorTheme =
        menu.publishedColorTheme ?? menu.colorTheme ?? "DEFAULT"

      const updatedMenu = await prisma.menu.update({
        where: { id },
        data: {
          serialData: menu.publishedData,
          fontTheme: publishedFontTheme,
          colorTheme: publishedColorTheme
        },
        select: {
          id: true,
          fontTheme: true,
          colorTheme: true,
          publishedFontTheme: true,
          publishedColorTheme: true,
          publishedData: true
        }
      })

      updateTag(`menu-${id}`)
      return {
        success: updatedMenu
      }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
 * Deletes a menu based on the provided ID and organization ID.
 *
 * @param id - The ID of the menu to delete.
 * @param organizationId - The ID of the organization that the menu belongs to.
 * @returns An object indicating the success or failure of the deletion operation.
 */
export const deleteMenu = authActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      organizationId: z.string()
    })
  )
  .action(async ({ parsedInput: { id, organizationId } }) => {
    try {
      await prisma.menu.delete({
        where: { id, organizationId }
      })

      updateTag(`menus-${organizationId}`)
      return {
        success: true
      }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
 * Duplicates a menu and its data.
 *
 * @param id - The ID of the menu to duplicate.
 * @returns An object with the duplicated menu if successful, or an object with the failure reason if unsuccessful.
 */
export const duplicateMenu = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    const proMember = await isProMember()
    const menuCount = await getMenuCount()

    const menuLimit = appConfig.menuLimit || 5
    if (!proMember && menuCount >= menuLimit) {
      return {
        failure: {
          reason: `Límite de ${menuLimit} menús alcanzado. Actualiza a Pro para crear más.`,
          code: BasicPlanLimits.MENU_LIMIT_REACHED
        }
      }
    }

    try {
      const sourceMenu = await prisma.menu.findUnique({
        where: { id }
      })

      if (!sourceMenu) {
        return {
          failure: {
            reason: "Menú no encontrado"
          }
        }
      }

      const duplicatedMenu = await prisma.menu.create({
        data: {
          name: `${sourceMenu.name} (copia)`,
          description: sourceMenu.description,
          status: "DRAFT",
          organizationId: sourceMenu.organizationId,
          fontTheme: sourceMenu.fontTheme,
          colorTheme: sourceMenu.colorTheme,
          serialData: sourceMenu.serialData
        }
      })

      updateTag(`menus-${sourceMenu.organizationId}`)
      return {
        success: duplicatedMenu
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

/**
 * Creates a color theme.
 *
 * @param id - The ID of the color theme.
 * @param name - The name of the color theme.
 * @param scope - The scope of the color theme.
 * @param themeType - The type of the color theme.
 * @param themeJSON - The JSON representation of the color theme.
 * @param organizationId - The ID of the organization (optional).
 * @returns An object with the success property set to the created color theme if successful, or an object with the failure property containing the reason for failure.
 */
export const createColorTheme = authActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      name: z.string(),
      scope: z.string(),
      themeType: z.string(),
      themeJSON: z.string(),
      organizationId: z.string().optional()
    })
  )
  .action(
    async ({
      parsedInput: { id, name, scope, themeType, themeJSON, organizationId }
    }) => {
      try {
        const colorTheme = await prisma.theme.create({
          data: {
            id,
            name,
            scope,
            themeType,
            themeJSON,
            organizationId
          }
        })

        return {
          success: colorTheme
        }
      } catch (error) {
        let message
        if (typeof error === "string") {
          message = error
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
            message = "Ya existe un tema personalizado"
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
 * Updates the color theme with the specified ID.
 *
 * @param id - The ID of the color theme.
 * @param name - The name of the color theme.
 * @param themeJSON - The JSON representation of the color theme.
 * @returns An object with the updated color theme if successful, or an object with the failure reason if an error occurs.
 */
export const updateColorTheme = authActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      name: z.string(),
      themeJSON: z.string()
    })
  )
  .action(async ({ parsedInput: { id, name, themeJSON } }) => {
    try {
      const colorTheme = await prisma.theme.update({
        where: { id },
        data: { name, themeJSON }
      })

      return {
        success: colorTheme
      }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002" || error.code === "SQLITE_CONSTRAINT") {
          message = "Ya existe un tema personalizado"
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
 * Deletes a color theme.
 *
 * @param {string} id - The ID of the color theme to delete.
 * @returns {Promise<{ success: boolean } | { failure: { reason: string } }>} - A promise that resolves to an object indicating the success or failure of the deletion operation.
 */
export const deleteColorTheme = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    const { getCurrentMembership } =
      await import("@/server/actions/user/queries")
    const membership = await getCurrentMembership()
    const currentOrg = membership?.organizationId
    try {
      await prisma.theme.delete({
        where: { id, organizationId: currentOrg }
      })

      return {
        success: true
      }
    } catch (error) {
      let message
      if (typeof error === "string") {
        message = error
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
