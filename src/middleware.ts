import authConfig from "@/auth.config"
import NextAuth from "next-auth"

const { auth: middleware } = NextAuth(authConfig)

export default middleware(req => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)

    return Response.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    )
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/menu-editor/:path*"]
}
