"use server"

import { cookies } from "next/headers"
import { z } from "zod"

import { authActionClient } from "@/lib/safe-actions"

export const assignOrganization = authActionClient
  .schema(
    z.object({
      cookieName: z.string(),
      organizationId: z.string()
    })
  )
  .action(
    // skipcq: JS-0116
    async ({ parsedInput: { cookieName, organizationId } }) => {
      cookies().set(cookieName, organizationId, {
        maxAge: 60 * 60 * 24 * 365
      })
    }
  )
