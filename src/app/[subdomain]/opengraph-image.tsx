import type { Organization } from "@prisma/client"
import { ImageResponse } from "next/og"

import { getBaseUrl } from "@/lib/utils"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 1200,
  height: 630
}

export const contentType = "image/png"

// Image generation
export default async function Image({
  params
}: {
  params: { subdomain: string }
}) {
  try {
    const org: Organization = await fetch(
      `${getBaseUrl()}/api/org?subdomain=${params.subdomain}`
    ).then(res => res.json())

    console.log(`${getBaseUrl()}/api/org?subdomain=${params.subdomain}`)
    console.dir(org)

    // Font
    const inter = fetch(
      new URL("../../../public/Inter-SemiBold.ttf", import.meta.url)
    ).then(res => res.arrayBuffer())

    return new ImageResponse(
      (
        <div
          tw="flex flex-col w-full h-full items-center justify-end bg-orange-500" // skipcq: JS-0455
          style={{
            backgroundImage: org?.banner
              ? `url(${org?.banner})`
              : "linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.8))",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div
            tw="flex w-full" // skipcq: JS-0455
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.8))"
            }}
          >
            {/* skipcq: JS-0455 */}
            <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-start p-8">
              {org?.logo && (
                <img
                  tw="w-24 h-24 md:w-30 md:h-30 rounded-full mr-8"
                  src={org?.logo}
                  alt={org?.name}
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
  } catch (error) {
    console.error(error)
    return new Response("Failed to generate image", {
      status: 500
    })
  }
}
