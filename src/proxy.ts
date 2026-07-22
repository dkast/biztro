import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const MENU_INTERNAL_PATH = "/menu-internal"
const MENU_PUBLIC_PATH = "/menu"

const RESERVED_SUBDOMAINS = new Set([
  "preview",
  "www",
  "images",
  "static",
  "mail",
  "pm-bounces",
  "send"
])

function isPublicFilePath(pathname: string) {
  return pathname.includes(".")
}

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

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/internal")) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/ingest") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/.well-known") ||
    isPublicFilePath(pathname)
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith(`${MENU_PUBLIC_PATH}/`)) {
    const subdomain = pathname.slice(`${MENU_PUBLIC_PATH}/`.length)

    if (subdomain && !subdomain.includes("/")) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = `${MENU_INTERNAL_PATH}/${subdomain}`
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  if (
    pathname === MENU_INTERNAL_PATH ||
    pathname.startsWith(`${MENU_INTERNAL_PATH}/`)
  ) {
    return new NextResponse(null, { status: 404 })
  }

  const subdomain = getSubdomainFromHost(request.nextUrl.hostname)
  if (!subdomain) return NextResponse.next()

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname =
    pathname === "/"
      ? `${MENU_INTERNAL_PATH}/${subdomain}`
      : `${MENU_INTERNAL_PATH}/${subdomain}${pathname}`
  return NextResponse.rewrite(rewriteUrl)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*|ingest|monitoring).*)"]
}
