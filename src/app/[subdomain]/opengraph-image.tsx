import { readFile } from "node:fs/promises"
import path from "node:path"
import * as Sentry from "@sentry/nextjs"
import { cacheLife, cacheTag } from "next/cache"
import { ImageResponse } from "next/og"

import { getOrganizationBySlug } from "@/server/actions/organization/queries"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

let interFontData: ArrayBuffer | Buffer | null = null

async function loadLocalFont() {
  if (interFontData) return interFontData
  const fontPath = path.join(process.cwd(), "public", "Inter-SemiBold.ttf")
  interFontData = await readFile(fontPath)
  return interFontData
}

async function getCachedOrganization(subdomain: string) {
  "use cache"
  cacheTag(`subdomain-${subdomain}`)
  cacheLife("days")
  return getOrganizationBySlug(subdomain)
}

export default async function Image({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  try {
    const { subdomain } = await params

    const org = await getCachedOrganization(subdomain)
    const orgName = org?.name ?? "Biztro"
    const fontData = await loadLocalFont()

    // Use Tailwind classes for layout, minimize inline styles
    return new ImageResponse(
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "flex-end",
          backgroundColor: "#f97316"
        }}
      >
        {org?.banner && (
          <img
            src={org.banner}
            alt="Background"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              zIndex: 0
            }}
          />
        )}
        {/* Gradient overlay for improved visibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to top, black, transparent)",
            opacity: 0.7,
            zIndex: 1
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex"
          }}
        >
          <div tw="flex w-full">
            <div tw="flex flex-row w-full py-12 px-24 items-end justify-start">
              {org?.logo && (
                <img
                  tw="w-30 h-30 rounded-full mr-8"
                  src={org.logo}
                  alt={orgName}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover" }}
                />
              )}
              <h2 tw="flex flex-col text-7xl font-semibold tracking-tight text-gray-50 text-left truncate">
                <span>{orgName}</span>
              </h2>
            </div>
          </div>
        </div>
      </div>,
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
            weight: 600
          }
        ]
      }
    )
  } catch (error) {
    console.error(error)
    Sentry.captureException(error, {
      tags: { section: "opengraph-image" }
    })
    return new Response("Failed to generate image", { status: 500 })
  }
}
