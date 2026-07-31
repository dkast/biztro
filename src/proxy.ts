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

// Requests to `<slug>.biztro.co` reach the app with the slug already prepended
// to the pathname (legacy edge rewrite from the old `app/[subdomain]` route).
// Strip it so every branch below sees the path the visitor actually requested.
function stripSubdomainPathPrefix(pathname: string, subdomain: string | null) {
  if (!subdomain) return pathname

  const prefix = `/${subdomain}`
  if (pathname === prefix) return "/"
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length)

  return pathname
}

export function proxy(request: NextRequest) {
  const subdomain = getSubdomainFromHost(request.nextUrl.hostname)
  const pathname = stripSubdomainPathPrefix(request.nextUrl.pathname, subdomain)

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
    const menuSlug = pathname.slice(`${MENU_PUBLIC_PATH}/`.length)

    if (menuSlug && !menuSlug.includes("/")) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = `${MENU_INTERNAL_PATH}/${menuSlug}`
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  if (
    pathname === MENU_INTERNAL_PATH ||
    pathname.startsWith(`${MENU_INTERNAL_PATH}/`)
  ) {
    return new NextResponse(null, { status: 404 })
  }

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
