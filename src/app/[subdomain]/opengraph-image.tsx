import { ImageResponse } from "next/og"
import * as Sentry from "@sentry/nextjs"

import { getBaseUrl } from "@/lib/utils"
import { env } from "@/env.mjs"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Image generation
// Simple in-memory cache for the font ArrayBuffer during a single build/runtime lifecycle
let interFontData: ArrayBuffer | null = null

async function loadGoogleFont(font: string, weights: number[], text: string) {
  const weightsParam = weights.map(w => `wght@${w}`).join(";")
  const url = `https://fonts.googleapis.com/css2?family=${font}:${weightsParam}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const resource = /src: url\((.+)\) format\('(opentype|truetype)'\)/.exec(css)

  if (resource?.[1]) {
    const response = await fetch(resource[1])
    if (response.status === 200) return await response.arrayBuffer()
  }

  throw new Error("failed to load font data")
}

export default async function Image({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  try {
    const { subdomain } = await params

    // Only select needed fields to reduce payload
    const org = await fetch(
      `${getBaseUrl()}/api/org?subdomain=${encodeURIComponent(subdomain)}&fields=name,logo,banner&secret=${env.AUTH_SECRET}`
    ).then(res => res.json())

    // Load Inter font (SemiBold ~ weight 600) via Google Fonts once and reuse
    if (!interFontData) {
      const sample = org?.name ? org.name.slice(0, 60) : "Biztro" // limit for query length
      interFontData = await loadGoogleFont("Inter", [600], sample)
    }

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
                  alt={org.name}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover" }}
                />
              )}
              <h2 tw="flex flex-col text-7xl font-semibold tracking-tight text-gray-50 text-left truncate">
                <span>{org?.name}</span>
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
            data: interFontData,
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
