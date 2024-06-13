import { NextResponse, type NextRequest } from "next/server"

import { getOrganizationBySubdomain } from "@/server/actions/organization/queries"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const subdomain = searchParams.get("subdomain")
  const secret = searchParams.get("secret")

  if (!subdomain) {
    return new NextResponse("Missing subdomain", {
      status: 400
    })
  }

  if (secret !== process.env.AUTH_SECRET) {
    return new NextResponse("Unauthorized", {
      status: 401
    })
  }

  const org = await getOrganizationBySubdomain(subdomain)

  return NextResponse.json(org)
}
