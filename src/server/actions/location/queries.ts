"use server"

import { unstable_cache as cache } from "next/cache"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"

export async function getDefaultLocation() {
  const membership = await getCurrentMembership()
  const currentOrgId = membership?.organizationId
  return await cache(
    async () => {
      const locationData = await prisma.location.findFirst({
        where: {
          organizationId: currentOrgId
        },
        include: {
          openingHours: true
        },
        orderBy: {
          createdAt: "asc"
        }
      })

      return locationData
    },
    [`default-location-${currentOrgId}`],
    {
      revalidate: 900,
      tags: [`default-location-${currentOrgId}`]
    }
  )()
}
