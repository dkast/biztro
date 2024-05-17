"use server"

import { cookies } from "next/headers"
import { z } from "zod"

import { action } from "@/lib/safe-actions"

export const assignOrganization = action(
  z.object({
    cookieName: z.string(),
    organizationId: z.string()
  }),
  // skipcq: JS-0116
  async ({ cookieName, organizationId }) => {
    cookies().set(cookieName, organizationId, {
      maxAge: 60 * 60 * 24 * 365
    })
  }
)
