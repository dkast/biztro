import { type NextRequest, NextResponse } from "next/server"

import { getMenuTranslationsByLocale } from "@/server/actions/item/translations"
import { getOrganizationBySlug } from "@/server/actions/organization/queries"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const subdomain = searchParams.get("subdomain")
  const locale = searchParams.get("locale")

  if (!subdomain || !locale) {
    return NextResponse.json(
      { error: "subdomain and locale are required" },
      { status: 400 }
    )
  }

  const org = await getOrganizationBySlug(subdomain)
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 })
  }

  const translations = await getMenuTranslationsByLocale(org.id, locale)

  return NextResponse.json(translations, {
    headers: {
      "Cache-Control": "public, max-age=3600"
    }
  })
}
