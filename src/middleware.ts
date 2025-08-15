import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

// Update matcher to the routes you want to protect
export const config = {
  matcher: ["/dashboard/:path*"]
}
