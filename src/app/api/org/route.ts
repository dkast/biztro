import { NextResponse, type NextRequest } from "next/server"

import { getOrganizationBySlug } from "@/server/actions/organization/queries"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const subdomain = searchParams.get("subdomain")
  const secret = searchParams.get("secret")
  const fields = searchParams.get("fields")?.split(",")

  if (!subdomain) {
    return new NextResponse("Missing subdomain", { status: 400 })
  }
  if (secret !== process.env.AUTH_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const org = await getOrganizationBySlug(subdomain)
  if (!org) return NextResponse.json(null)

  // If fields param is present, return only those fields
  if (fields && Array.isArray(fields) && fields.length > 0) {
    const filtered: Partial<typeof org> = {}
    for (const key of fields) {
      if (key in org)
        // @ts-expect-error: dynamic key assignment for API response
        filtered[key as keyof typeof org] = org[key as keyof typeof org]
    }
    return NextResponse.json(filtered)
  }
  return NextResponse.json(org)
}
