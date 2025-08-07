import { ImageResponse } from "next/og"

import { getBaseUrl } from "@/lib/utils"
import { env } from "@/env.mjs"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Image generation
export default async function Image({
  params
}: {
  params: { subdomain: string }
}) {
  try {
    // Only select needed fields to reduce payload
    const org = await fetch(
      `${getBaseUrl()}/api/org?subdomain=${params.subdomain}&fields=name,logo,banner&secret=${env.AUTH_SECRET}`
    ).then(res => res.json())

    // Font loading preserved
    const inter = fetch(
      new URL("../../../public/Inter-SemiBold.ttf", import.meta.url)
    ).then(res => res.arrayBuffer())

    // Use Tailwind classes for layout, minimize inline styles
    return new ImageResponse(
      (
        <div
          tw="flex flex-col w-full h-full items-center justify-end bg-orange-500" // skipcq: JS-0455
          style={
            org?.banner
              ? {
                  backgroundImage: `url(${org.banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              : undefined
          }
        >
          {/* skipcq: JS-0455 */}
          <div tw="flex w-full bg-gradient-to-b from-transparent to-black/80">
            {/* skipcq: JS-0455 */}
            <div tw="flex flex-col md:flex-row w-full py-12 px-24 md:items-center justify-start">
              {org?.logo && (
                <img
                  tw="w-24 h-24 md:w-30 md:h-30 rounded-full mr-8"
                  src={org.logo}
                  alt={org.name}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover" }}
                />
              )}
              {/* skipcq: JS-0455 */}
              <h2 tw="flex flex-col text-5xl sm:text-6xl font-semibold tracking-tight text-gray-50 text-left">
                <span>{org?.name}</span>
              </h2>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: await inter,
            style: "normal",
            weight: 400
          }
        ]
      }
    )
  } catch {
    return new Response("Failed to generate image", { status: 500 })
  }
}
