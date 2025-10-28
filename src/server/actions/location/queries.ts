"use server"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"

export async function getDefaultLocation() {
  const membership = await getCurrentMembership()
  const currentOrgId = membership?.organizationId
  return await prisma.location.findFirst({
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
}
