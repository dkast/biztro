"use server"

import { Prisma } from "@prisma/client"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { z } from "zod"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { action } from "@/lib/safe-actions"
import { menuSchema } from "@/lib/types"

export const createMenu = action(
  menuSchema,
  async ({ name, description, status }) => {
    const currentOrg = cookies().get(appConfig.cookieOrg)?.value

    if (!currentOrg) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    try {
      const menu = await prisma.menu.create({
        data: {
          name,
          description,
          status,
          organizationId: currentOrg
        }
      })

      revalidateTag(`menus-${currentOrg}`)

      return {
        success: menu
      }
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

export const updateMenuName = action(
  z.object({
    id: z.string(),
    name: z.string()
  }),
  async ({ id, name }) => {
    try {
      const menu = await prisma.menu.update({
        where: { id },
        data: { name }
      })

      // revalidateTag(`menus-${menu.organizationId}`)
      revalidateTag(`menu-${id}`)

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
  }
)

export const updateMenuStatus = action(
  z.object({
    id: z.string(),
    subdomain: z.string(),
    status: z.enum(["PUBLISHED", "DRAFT"]),
    fontTheme: z.string(),
    colorTheme: z.string(),
    serialData: z.string()
  }),
  async ({ id, subdomain, status, fontTheme, colorTheme, serialData }) => {
    try {
      const menu = await prisma.menu.update({
        where: { id },
        data: {
          status,
          fontTheme,
          colorTheme,
          serialData,
          publishedData: serialData
        }
      })

      revalidateTag(`menu-${id}`)
      revalidateTag(`site-${subdomain}`)

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

export const updateMenuSerialData = action(
  z.object({
    id: z.string(),
    fontTheme: z.string(),
    colorTheme: z.string(),
    serialData: z.string()
  }),
  async ({ id, fontTheme, colorTheme, serialData }) => {
    try {
      const menu = await prisma.menu.update({
        where: { id },
        data: { fontTheme, colorTheme, serialData }
      })

      revalidateTag(`menu-${id}`)

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

export const deleteMenu = action(
  z.object({
    id: z.string(),
    organizationId: z.string()
  }),
  async ({ id, organizationId }) => {
    try {
      await prisma.menu.delete({
        where: { id, organizationId }
      })

      revalidateTag(`menu-${id}`)

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
  }
)

export const createColorTheme = action(
  z.object({
    name: z.string(),
    scope: z.string(),
    themeType: z.string(),
    themeJSON: z.string(),
    organizationId: z.string().optional()
  }),
  async ({ name, scope, themeType, themeJSON, organizationId }) => {
    try {
      const colorTheme = await prisma.theme.create({
        data: {
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
