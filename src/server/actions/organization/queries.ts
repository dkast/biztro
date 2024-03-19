"use server"

import prisma from "@/lib/prisma"

export async function getOrganization(id: string) {
  const org = await prisma.organization.findUnique({
    where: {
      id
    }
  })

  return org
}
