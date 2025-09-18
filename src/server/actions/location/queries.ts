"use server"

// import { unstable_cache as cache } from "next/cache"
import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"

export async function getDefaultLocation() {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId
  // return await cache(
  //   async () => {
  const location = await prisma.location.findFirst({
    where: {
      organizationId: currentOrg
    },
    include: {
      openingHours: true
    },
    orderBy: {
      createdAt: "asc"
    }
  })

  return location
  //   },
  //   [`default-location-${currentOrg}`],
  //   {
  //     revalidate: 900,
  //     tags: [`default-location-${currentOrg}`]
  //   }
  // )()
}
