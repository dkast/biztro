"use server"

import { cookies } from "next/headers"

export const assignOrganization = async (
  key: string,
  organizationId: string
) => {
  // Set the current organization
  cookies().set(key, organizationId, {
    maxAge: 60 * 60 * 24 * 365
  })
}
