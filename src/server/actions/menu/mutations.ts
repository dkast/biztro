"use server"

import { Prisma } from "@/generated/prisma-client/client"
import * as Sentry from "@sentry/nextjs"
import { updateTag } from "next/cache"
import { z } from "zod/v4"

import { getMenuCount } from "@/server/actions/menu/queries"
import {
  MISSING_ORGANIZATION_REASON,
  NOT_FOUND_OR_UNAUTHORIZED_REASON
} from "@/server/actions/tenant-guards"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { authActionClient, authMemberActionClient } from "@/lib/safe-actions"
import { BasicPlanLimits } from "@/lib/types/billing"
import { menuSchema, MenuStatus } from "@/lib/types/menu"

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
export const updateMenuName = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      name: z.string()
    })
  )
  .action(async ({ parsedInput: { id, name }, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) {
      return {
        failure: {
          reason: MISSING_ORGANIZATION_REASON
        }
      }
    }

    try {
      const existingMenu = await prisma.menu.findFirst({
        where: { id, organizationId },
        select: { id: true }
      })

      if (!existingMenu) {
        return {
          failure: {
            reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
          }
        }
      }

      const menu = await prisma.menu.update({
        where: { id },
        data: { name }
      })

      updateTag(`menus-${organizationId}`)
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
 * The organization subdomain is derived server-side for cache invalidation.
 *
 * @param id - The ID of the menu.
 * @param status - The status of the menu. Must be either "PUBLISHED" or "DRAFT".
 * @param fontTheme - The font theme of the menu.
 * @param colorTheme - The color theme of the menu.
 * @param serialData - The serial data of the menu.
 * @returns An object with the updated menu if successful, or an object with the failure reason if unsuccessful.
 */
export const updateMenuStatus = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      status: z.enum(["PUBLISHED", "DRAFT"]),
      fontTheme: z.string(),
      colorTheme: z.string(),
      serialData: z.string()
    })
  )
  .action(
    async ({
      parsedInput: { id, status, fontTheme, colorTheme, serialData },
      ctx: { member }
    }) => {
      const organizationId = member.organizationId
      if (!organizationId) {
        return {
          failure: {
            reason: MISSING_ORGANIZATION_REASON
          }
        }
      }

      try {
        const menu = await prisma.$transaction(async tx => {
          const existingMenu = await tx.menu.findFirst({
            where: { id, organizationId },
            select: { id: true }
          })

          if (!existingMenu) return null

          const updated = await tx.menu.update({
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
                  },
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              organizationId: true,
              serialData: true,
              publishedData: true,
              publishedAt: true,
              fontTheme: true,
              colorTheme: true,
              publishedFontTheme: true,
              publishedColorTheme: true,
              organization: {
                select: {
                  slug: true
                }
              }
            }
          })

          if (status === "PUBLISHED") {
            await tx.organization.update({
              where: { id: updated.organizationId },
              data: { activeMenuId: updated.id }
            })
          } else {
            await tx.organization.updateMany({
              where: {
                id: updated.organizationId,
                activeMenuId: updated.id
              },
              data: { activeMenuId: null }
            })
          }

          return updated
        })

        if (!menu) {
          return {
            failure: {
              reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
            }
          }
        }

        updateTag(`subdomain-${menu.organization.slug}`)
        updateTag(`menu-${menu.id}`)
        updateTag(`menus-${organizationId}`)
        return {
          success: menu
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { section: "menu-update-status" },
          extra: { menuId: id, status }
        })
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
 * Sets a menu as the active menu for the current organization.
 *
 * @param id - The ID of the menu to mark as active.
 * @returns An object indicating success or failure.
 */
export const setActiveMenu = authActionClient
  .inputSchema(
    z.object({
      id: z.string()
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    const currentOrg = await getCurrentOrganization()

    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    try {
      const menu = await prisma.menu.findFirst({
        where: {
          id,
          organizationId: currentOrg.id
        },
        select: {
          id: true,
          status: true,
          organizationId: true
        }
      })

      if (!menu) {
        return {
          failure: {
            reason: "Menú no encontrado"
          }
        }
      }

      if (menu.status !== MenuStatus.PUBLISHED) {
        return {
          failure: {
            reason: "Solo puedes activar un menú publicado"
          }
        }
      }

      await prisma.organization.update({
        where: { id: currentOrg.id },
        data: { activeMenuId: menu.id }
      })

      const orgSlug =
        currentOrg.slug ??
        (
          await prisma.organization.findUnique({
            where: { id: currentOrg.id },
            select: { slug: true }
          })
        )?.slug

      if (orgSlug) {
        updateTag(`subdomain-${orgSlug}`)
      }
      updateTag(`menus-${currentOrg.id}`)
      updateTag(`menu-${menu.id}`)

      return {
        success: true
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "menu-set-active" },
        extra: { menuId: id }
      })
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
 * Updates the menu serial data.
 *
 * @param id - The ID of the menu.
 * @param fontTheme - The font theme of the menu.
 * @param colorTheme - The color theme of the menu.
 * @param serialData - The serial data of the menu.
 * @returns An object with the updated menu if successful, or an object with the failure reason if unsuccessful.
 */
export const updateMenuSerialData = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      fontTheme: z.string(),
      colorTheme: z.string(),
      serialData: z.string()
    })
  )
  .action(
    async ({
      parsedInput: { id, fontTheme, colorTheme, serialData },
      ctx: { member }
    }) => {
      const organizationId = member.organizationId
      if (!organizationId) {
        return {
          failure: {
            reason: MISSING_ORGANIZATION_REASON
          }
        }
      }

      try {
        const existingMenu = await prisma.menu.findFirst({
          where: { id, organizationId },
          select: { id: true }
        })

        if (!existingMenu) {
          return {
            failure: {
              reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
            }
          }
        }

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

export const revertMenuToPublished = authMemberActionClient
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
      const menu = await prisma.menu.findFirst({
        where: { id, organizationId },
        select: {
          publishedData: true,
          publishedFontTheme: true,
          publishedColorTheme: true,
          fontTheme: true,
          colorTheme: true
        }
      })

      if (!menu) {
        return {
          failure: {
            reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
          }
        }
      }

      if (!menu.publishedData) {
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
          updatedAt: true,
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
export const deleteMenu = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      organizationId: z.string().optional()
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
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { activeMenuId: true }
      })

      if (organization?.activeMenuId === id) {
        return {
          failure: {
            reason:
              "No puedes eliminar el menú activo. Selecciona otro menú activo primero."
          }
        }
      }

      const menu = await prisma.menu.findFirst({
        where: { id, organizationId },
        select: { id: true }
      })

      if (!menu) {
        return {
          failure: {
            reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
          }
        }
      }

      await prisma.menu.delete({
        where: { id }
      })

      updateTag(`menus-${organizationId}`)
      return {
        success: true
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "menu-delete" },
        extra: { menuId: id, organizationId }
      })
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
export const duplicateMenu = authMemberActionClient
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
      const sourceMenu = await prisma.menu.findFirst({
        where: { id, organizationId }
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
          organizationId,
          fontTheme: sourceMenu.fontTheme,
          colorTheme: sourceMenu.colorTheme,
          serialData: sourceMenu.serialData
        }
      })

      updateTag(`menus-${organizationId}`)
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
export const createColorTheme = authMemberActionClient
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
      parsedInput: { id, name, scope, themeType, themeJSON },
      ctx: { member }
    }) => {
      const organizationId = member.organizationId
      if (!organizationId) {
        return {
          failure: {
            reason: MISSING_ORGANIZATION_REASON
          }
        }
      }

      if (scope === "GLOBAL") {
        return {
          failure: {
            reason: "No puedes crear temas globales desde esta acción"
          }
        }
      }

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
export const updateColorTheme = authMemberActionClient
  .inputSchema(
    z.object({
      id: z.string(),
      name: z.string(),
      themeJSON: z.string()
    })
  )
  .action(async ({ parsedInput: { id, name, themeJSON }, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) {
      return {
        failure: {
          reason: MISSING_ORGANIZATION_REASON
        }
      }
    }

    try {
      const existingTheme = await prisma.theme.findFirst({
        where: { id, organizationId },
        select: { id: true }
      })

      if (!existingTheme) {
        return {
          failure: {
            reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
          }
        }
      }

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
export const deleteColorTheme = authMemberActionClient
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
      const existingTheme = await prisma.theme.findFirst({
        where: { id, organizationId },
        select: { id: true }
      })

      if (!existingTheme) {
        return {
          failure: {
            reason: NOT_FOUND_OR_UNAUTHORIZED_REASON
          }
        }
      }

      await prisma.theme.delete({
        where: { id }
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
