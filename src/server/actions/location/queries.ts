"use server"

import { cacheTag } from "next/cache"

import prisma from "@/lib/prisma"

export async function getDefaultLocation(organizationId: string) {
  "use cache"

  if (!organizationId) {
    return null
  }

  cacheTag(`locations-${organizationId}`)
  return await prisma.location.findFirst({
    where: {
      organizationId
    },
    include: {
      openingHours: true
    },
    orderBy: {
      createdAt: "asc"
    }
  })
}
