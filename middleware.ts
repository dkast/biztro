export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/menu-editor/:path*"]
}
