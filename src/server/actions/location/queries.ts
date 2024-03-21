"use server"

import prisma from "@/lib/prisma"

export async function getDefaultLocation() {
  const location = await prisma.location.findFirst({
    orderBy: {
      createdAt: "asc"
    }
  })

  return location
}
