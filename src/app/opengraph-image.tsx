import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 1200,
  height: 630
}

export const contentType = "image/png"

// Image generation
export default async function Image() {
  try {
    // Font
    const inter = fetch(
      new URL("../../public/Inter-SemiBold.ttf", import.meta.url)
    ).then(res => res.arrayBuffer())

    return new ImageResponse(
      (
        // ImageResponse JSX element
        <div
          tw="flex flex-col w-full h-full items-center justify-center bg-white p-8" // skipcq: JS-0455
          style={{
            backgroundImage: "linear-gradient(to bottom, #ffffff, #ffd1c1)"
          }}
        >
          <div
            tw="flex flex-row justify-center" // skipcq: JS-0455
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.78">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M24 10.1268H25.4322C24.5562 9.94062 24 10.1268 24 10.1268ZM25.4322 10.1268C28.6806 10.8172 36.3274 16.6273 36.3274 56.0336V263.275C36.0495 267.875 35.9086 272.511 35.9086 277.181C35.9086 402.45 137.337 504 262.454 504C387.572 504 489 402.45 489 277.181C489 151.912 387.572 50.3619 262.454 50.3619C220.67 50.3619 181.527 61.6879 147.922 81.4409V53.1268C147.922 29.3786 128.671 10.1268 104.922 10.1268H25.4322ZM263.1 391.555C327.263 391.555 379.277 339.478 379.277 275.238C379.277 210.997 327.263 158.92 263.1 158.92C198.937 158.92 146.922 210.997 146.922 275.238C146.922 339.478 198.937 391.555 263.1 391.555Z"
                  fill="url(#paint0_linear_3_2)"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M24 10.1268H25.4322C24.5562 9.94062 24 10.1268 24 10.1268ZM25.4322 10.1268C28.6806 10.8172 36.3274 16.6273 36.3274 56.0336V263.275C36.0495 267.875 35.9086 272.511 35.9086 277.181C35.9086 402.45 137.337 504 262.454 504C387.572 504 489 402.45 489 277.181C489 151.912 387.572 50.3619 262.454 50.3619C220.67 50.3619 181.527 61.6879 147.922 81.4409V53.1268C147.922 29.3786 128.671 10.1268 104.922 10.1268H25.4322ZM263.1 391.555C327.263 391.555 379.277 339.478 379.277 275.238C379.277 210.997 327.263 158.92 263.1 158.92C198.937 158.92 146.922 210.997 146.922 275.238C146.922 339.478 198.937 391.555 263.1 391.555Z"
                  fill="url(#paint1_linear_3_2)"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_3_2"
                  x1="256"
                  y1="10.0441"
                  x2="256"
                  y2="504"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.494792" stop-color="#FF3205" />
                  <stop offset="1" stop-color="#FF6B00" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_3_2"
                  x1="256"
                  y1="10.0441"
                  x2="256"
                  y2="504"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.494792" stop-color="#FF3205" />
                  <stop offset="1" stop-color="#FF6B00" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2
            tw="text-6xl mt-12 mb-6" // skipcq: JS-0455
          >
            Tu menú digital en minutos
          </h2>
          <p tw="text-4xl text-zinc-600 text-center px-24">
            {" "}
            {/* skipcq: JS-0455 */}
            Biztro te permite crea tu menú digital y QR para compartirlo con tus
            clientes
          </p>
        </div>
      ),
      // ImageResponse options
      {
        // For convenience, we can re-use the exported opengraph-image
        // size config to also set the ImageResponse's width and height.
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
    return new Response(`Failed to generate image`, {
      status: 500
    })
  }
}
