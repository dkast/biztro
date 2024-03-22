import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"

export async function getMenuItems() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  return await prisma.menuItem.findMany({
    where: {
      organizationId: currentOrg
    }
  })
}
