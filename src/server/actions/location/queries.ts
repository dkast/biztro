"use server"

// import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"

export async function getDefaultLocation() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  // return await cache(
  //   async () => {
  const location = await prisma.location.findFirst({
    where: {
      organizationId: currentOrg
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
