import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const RESERVED_SUBDOMAINS = new Set(["preview", "www"])

function getSubdomainFromHost(hostname: string) {
  if (hostname === "biztro.co" || hostname === "localhost") return null

  if (hostname.endsWith(".biztro.co")) {
    const subdomain = hostname.slice(0, -".biztro.co".length)
    return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain
  }

  if (hostname.endsWith(".localhost")) {
    return hostname.slice(0, -".localhost".length)
  }

  return null
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  const subdomain = getSubdomainFromHost(request.nextUrl.hostname)
  if (!subdomain) return NextResponse.next()

  if (
    pathname === `/${subdomain}` ||
    pathname.startsWith(`/${subdomain}/`) ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next()
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname =
    pathname === "/" ? `/${subdomain}` : `/${subdomain}${pathname}`

  return NextResponse.rewrite(rewriteUrl)
}

// Update matcher to the routes you want to protect
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|ingest|monitoring).*)"
  ]
}
