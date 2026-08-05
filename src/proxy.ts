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

function isMenuOpenGraphImagePath(pathname: string) {
  const segments = pathname.split("/")

  return (
    segments.length === 4 &&
    segments[1] === "menu-internal" &&
    Boolean(segments[2]) &&
    segments[3] === "opengraph-image"
  )
}

// Tenant traffic reaches the app through a Cloudflare Worker that proxies
// `<slug>.biztro.co` to the Vercel origin, so the `Host` header (and therefore
// `nextUrl.hostname`) is the origin host. The worker forwards the visitor host
// in `x-original-host` / `x-forwarded-host`.
function getRequestHostname(request: NextRequest) {
  const forwardedHost =
    request.headers.get("x-original-host") ??
    request.headers.get("x-forwarded-host")

  const hostname = forwardedHost?.split(",")[0]?.trim()
  if (!hostname) return request.nextUrl.hostname

  return hostname.split(":")[0]!.toLowerCase()
}

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug) && !RESERVED_SUBDOMAINS.has(slug)
}

function getTenantSlug(request: NextRequest) {
  const fromHost = getSubdomainFromHost(getRequestHostname(request))
  if (fromHost) return fromHost

  // Fallback for proxies that overwrite the forwarded host headers.
  const tenantSlug = request.headers.get("x-tenant-slug")?.trim().toLowerCase()
  if (tenantSlug && isValidSlug(tenantSlug)) return tenantSlug

  return null
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

// The Cloudflare Worker prefixes tenant requests with `/<slug>` before proxying
// them to the origin. Strip it so every branch below sees the path the visitor
// actually requested (also a no-op when the prefix is not present).
function stripSubdomainPathPrefix(pathname: string, subdomain: string | null) {
  if (!subdomain) return pathname

  const prefix = `/${subdomain}`
  if (pathname === prefix) return "/"
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length)

  return pathname
}

export function proxy(request: NextRequest) {
  const subdomain = getTenantSlug(request)
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
    if (isMenuOpenGraphImagePath(pathname)) {
      return NextResponse.next()
    }

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
