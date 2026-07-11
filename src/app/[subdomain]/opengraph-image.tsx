import { readFile } from "node:fs/promises"
import path from "node:path"
import * as Sentry from "@sentry/nextjs"
import { cacheLife, cacheTag } from "next/cache"
import { ImageResponse } from "next/og"
import sharp from "sharp"

import { getOrganizationBySlug } from "@/server/actions/organization/queries"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

let interFontData: ArrayBuffer | Buffer | null = null
const publicAssetDataUrls = new Map<string, string>()
const publicAssetBuffers = new Map<string, Buffer>()

function getPublicAssetMimeType(filename: string) {
  const ext = path.extname(filename).toLowerCase()

  return ext === ".png"
    ? "image/png"
    : ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream"
}

async function loadLocalFont() {
  if (interFontData) return interFontData
  const fontPath = path.join(process.cwd(), "public", "Inter-SemiBold.ttf")
  interFontData = await readFile(fontPath)
  return interFontData
}

async function loadPublicAssetBuffer(filename: string) {
  const cachedAsset = publicAssetBuffers.get(filename)
  if (cachedAsset) return cachedAsset

  const filePath = path.join(process.cwd(), "public", filename)
  const file = await readFile(filePath)
  const buffer = Buffer.from(file)

  publicAssetBuffers.set(filename, buffer)

  return buffer
}

async function loadPublicAssetDataUrl(filename: string) {
  const cachedAsset = publicAssetDataUrls.get(filename)
  if (cachedAsset) return cachedAsset

  const file = await loadPublicAssetBuffer(filename)
  const mime = getPublicAssetMimeType(filename)
  const dataUrl = `data:${mime};base64,${Buffer.from(file).toString("base64")}`

  publicAssetDataUrls.set(filename, dataUrl)

  return dataUrl
}

async function loadRemoteAssetDataUrl(url: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load remote asset: ${url}`)
  }

  const mime =
    response.headers.get("content-type") ?? "application/octet-stream"
  const asset = Buffer.from(await response.arrayBuffer())

  return `data:${mime};base64,${asset.toString("base64")}`
}

function escapeXml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

async function renderFallbackOgImage({
  brandLogoDataUrl,
  fontData,
  orgLogoDataUrl,
  orgName
}: {
  brandLogoDataUrl: string
  fontData: ArrayBuffer | Buffer
  orgLogoDataUrl: string | null
  orgName: string
}) {
  const fallbackBuffer = await loadPublicAssetBuffer("og-image-bg.jpg")
  const fontBuffer = Buffer.isBuffer(fontData)
    ? fontData
    : Buffer.from(fontData)
  const fontBase64 = fontBuffer.toString("base64")
  const safeOrgName = escapeXml(orgName)
  const titleX = orgLogoDataUrl ? 180 : 48
  const overlaySvg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overlay" x1="600" y1="0" x2="600" y2="630" gradientUnits="userSpaceOnUse">
          <stop stop-color="rgba(0, 0, 0, 0.62)" />
          <stop offset="0.34" stop-color="rgba(0, 0, 0, 0.16)" />
          <stop offset="1" stop-color="rgba(0, 0, 0, 0.78)" />
        </linearGradient>
        <style>
          @font-face {
            font-family: 'Inter';
            src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
            font-weight: 600;
          }
          .brand {
            fill: #fff7ed;
            font-family: 'Inter', sans-serif;
            font-size: 28px;
            font-weight: 600;
          }
          .title {
            fill: #ffffff;
            font-family: 'Inter', sans-serif;
            font-size: 82px;
            font-weight: 600;
          }
        </style>
        <clipPath id="org-logo-clip">
          <circle cx="104" cy="510" r="56" />
        </clipPath>
      </defs>
      <rect width="1200" height="630" fill="url(#overlay)" />
      <image href="${brandLogoDataUrl}" x="48" y="40" width="42" height="42" preserveAspectRatio="xMidYMid meet" />
      <text x="104" y="73" class="brand">biztro</text>
      ${
        orgLogoDataUrl
          ? `<image href="${orgLogoDataUrl}" x="48" y="454" width="112" height="112" clip-path="url(#org-logo-clip)" preserveAspectRatio="xMidYMid slice" />`
          : ""
      }
      <text x="${titleX}" y="548" class="title">${safeOrgName}</text>
    </svg>
  `.trim()

  const image = await sharp(fallbackBuffer)
    .resize(size.width, size.height, {
      fit: "cover",
      position: "centre"
    })
    .composite([
      {
        input: Buffer.from(overlaySvg),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toBuffer()

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": contentType
    }
  })
}

async function getCachedOrganization(subdomain: string) {
  "use cache"
  cacheTag(`subdomain-${subdomain}`)
  cacheLife("days")
  return await getOrganizationBySlug(subdomain)
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
    const brandLogo = await loadPublicAssetDataUrl("logo.png")

    if (!org?.banner) {
      const orgLogoDataUrl = org?.logo
        ? await loadRemoteAssetDataUrl(org.logo).catch(() => null)
        : null

      return renderFallbackOgImage({
        brandLogoDataUrl: brandLogo,
        fontData,
        orgLogoDataUrl,
        orgName
      })
    }

    const backgroundSrc = org.banner

    return new ImageResponse(
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#f97316"
        }}
      >
        {backgroundSrc && (
          <img
            src={backgroundSrc}
            alt="Background"
            width={size.width}
            height={size.height}
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.16) 34%, rgba(0, 0, 0, 0.78) 100%)",
            zIndex: 1
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 48px 52px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}
          >
            <img src={brandLogo} alt="Biztro" width={42} height={42} />
            <span
              style={{
                color: "#fff7ed",
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.06em",
                lineHeight: 1,
                textTransform: "lowercase"
              }}
            >
              biztro
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "20px",
              maxWidth: "82%"
            }}
          >
            {org?.logo && (
              <img
                src={org.logo}
                alt={orgName}
                width={112}
                height={112}
                style={{
                  width: "112px",
                  height: "112px",
                  borderRadius: "999px",
                  objectFit: "cover",
                  objectPosition: "center",
                  flexShrink: 0,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28)"
                }}
              />
            )}
            <h1
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: 82,
                fontWeight: 600,
                lineHeight: 1.02,
                letterSpacing: "-0.06em",
                textWrap: "balance",
                textShadow: "0 10px 30px rgba(0, 0, 0, 0.32)"
              }}
            >
              {orgName}
            </h1>
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
