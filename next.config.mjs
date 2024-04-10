import { createMdxtsPlugin } from "mdxts/next"
import { withAxiom } from "next-axiom"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs")

const withMdxts = createMdxtsPlugin({
  theme: "nord",
  gitSource: "https://github.com/souporserious/mdxts"
})

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
        port: "",
        pathname: "/*/**"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/*/**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      }
    ]
  },
  // LEGACY: This is for the old image optimization provider
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "images.unsplash.com",
      "res.cloudinary.com"
    ]
  },
  // pageExtensions: ["md", "mdx", "js", "jsx", "ts", "tsx"],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  }
}

export default withMdxts(config)
