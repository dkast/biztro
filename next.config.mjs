import { withContentCollections } from "@content-collections/next"
import withBundleAnalyzer from "@next/bundle-analyzer"
import { withSentryConfig } from "@sentry/nextjs"
import { withVercelToolbar } from "@vercel/toolbar/plugins/next"
import { withAxiom } from "next-axiom"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs")

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
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
  // skipcq: JS-0116
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*"
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*"
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide"
      }
    ]
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  // pageExtensions: ["md", "mdx", "js", "jsx", "ts", "tsx"]
  serverExternalPackages: ["import-in-the-middle"],
  // Allow builds to succeed even when TypeScript or ESLint report errors.
  // This is useful for CI or when incremental migration is in progress.
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false
  }
}

/** @type {import("next").NextConfig} */
let nextConfig // skipcq: JS-E1009
// If in Turbo Pack mode, do not use Sentry
if (!process.env.TURBOPACK) {
  // Only enable the bundle analyzer when ANALYZE=true is set in the environment.
  const enableBundleAnalyzer = process.env.ANALYZE === "true"

  const baseConfig = withContentCollections(
    withVercelToolbar()(withSentryConfig(withAxiom(config))),
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      org: "dkast",
      project: "biztro",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Automatically annotate React components to show their full name in breadcrumbs and session replay
      reactComponentAnnotation: {
        enabled: true
      },

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,

      unstable_sentryWebpackPluginOptions: {
        applicationKey: "biztro"
      }
    }
  )

  nextConfig = enableBundleAnalyzer
    ? withBundleAnalyzer(baseConfig)
    : baseConfig
} else {
  nextConfig = withContentCollections(withVercelToolbar()(withAxiom(config)))
}

export default nextConfig
