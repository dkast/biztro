import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { ImageResponse } from "next/og"

import { getOrganizationBySubdomain } from "@/server/actions/organization/queries"

// Image metadata
export const alt = "Open Graph Image"
export const size = {
  width: 800,
  height: 400
}

export const contentType = "image/png"

const font = fs.promises.readFile(
  path.join(
    fileURLToPath(import.meta.url),
    "../../../../public/Inter-SemiBold.ttf"
  )
)

// Image generation
export default async function Image({
  params
}: {
  params: { subdomain: string }
}) {
  try {
    const org = await getOrganizationBySubdomain(params.subdomain)
    const fontData = await font

    return new ImageResponse(
      (
        <div
          tw="flex flex-col w-full h-full items-center justify-end bg-orange-500"
          style={{
            backgroundImage: org?.banner
              ? `url(${org?.banner})`
              : "linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.8))",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div
            tw="flex w-full"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.8))"
            }}
          >
            <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-start p-8">
              <>
                {org?.logo && (
                  <img
                    tw="w-16 h-16 md:w-24 md:h-24 rounded-full mr-4"
                    src={org?.logo}
                    alt={org?.name}
                  />
                )}
                <h2 tw="flex flex-col text-3xl sm:text-4xl font-semibold tracking-tight text-gray-50 text-left">
                  <span>{org?.name}</span>
                </h2>
              </>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
            weight: 400
          }
        ]
      }
    )
  } catch (error) {
    console.error(error)
    return new Response(`Failed to generate image`, {
      status: 500
    })
  }
}
