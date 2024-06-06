import { rgbaToHex, type RgbaColor } from "@uiw/react-color"
import lz from "lzutf8"
import type { Metadata, ResolvingMetadata } from "next"
import { type Viewport } from "next"
import { notFound } from "next/navigation"

import ResolveEditor from "@/app/[subdomain]/resolve-editor"
import { getMenuByOrgSubdomain } from "@/server/actions/menu/queries"
import { getOrganizationBySubdomain } from "@/server/actions/organization/queries"

export async function generateMetadata(
  {
    params
  }: {
    params: { subdomain: string }
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const org = await getOrganizationBySubdomain(params.subdomain)

  if (org) {
    const description =
      org.description && org.description.length > 0
        ? org.description
        : (await parent).description
    return {
      title: org.name,
      description: description,
      openGraph: {
        images: [org.banner ?? "og-image.jpg"]
      }
    }
  } else {
    return {
      title: "No encontrado"
    }
  }
}

export async function generateViewport({
  params
}: {
  params: { subdomain: string }
}): Promise<Viewport> {
  const siteMenu = await getMenuByOrgSubdomain(params.subdomain)

  if (!params.subdomain || !siteMenu) {
    return {
      themeColor: "#000000"
    }
  }

  let json
  if (siteMenu.serialData) {
    json = lz.decompress(lz.decodeBase64(siteMenu.serialData))
  }

  let backgroundColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 }

  // Search container style (color)
  const data = JSON.parse(json)
  const keys = Object.keys(data)
  keys.forEach(el => {
    const node = data[el]
    const { displayName } = node
    if (displayName === "Sitio") {
      backgroundColor = data[el]?.props?.backgroundColor
    }
  })

  if (backgroundColor) {
    return {
      themeColor: rgbaToHex(backgroundColor)
    }
  } else {
    return {
      themeColor: "#000000"
    }
  }
}

// export const viewport: Viewport = {
//   themeColor: "#000000"
// }

export default async function SitePage({
  params
}: {
  params: { subdomain: string }
}) {
  const siteMenu = await getMenuByOrgSubdomain(params.subdomain)

  if (!params.subdomain || !siteMenu) {
    return notFound()
  }

  let json
  if (siteMenu.serialData) {
    json = lz.decompress(lz.decodeBase64(siteMenu.serialData))
  }

  let backgroundColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 }
  let textColor: RgbaColor = { r: 0, g: 0, b: 0, a: 1 }

  // Search container style (color)
  const data = JSON.parse(json)
  const keys = Object.keys(data)
  keys.forEach(el => {
    const node = data[el]
    const { displayName } = node
    if (displayName === "Sitio") {
      backgroundColor = data[el]?.props?.backgroundColor
    }
    if (displayName === "Cabecera") {
      textColor = data[el]?.props?.color
    }
  })

  return (
    <div
      style={{
        backgroundColor: `${rgbaToHex(backgroundColor)}`
      }}
      className="flex min-h-screen flex-col"
    >
      <div className="grow">
        <ResolveEditor json={json} />
      </div>
      <p
        className="py-4 text-center text-xs"
        style={{
          color: `${rgbaToHex(textColor)}`
        }}
      >
        Última actualiazión:{" "}
        {siteMenu.publishedAt
          ? new Intl.DateTimeFormat("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric"
            }).format(new Date(siteMenu.publishedAt))
          : ""}
      </p>
    </div>
  )
}
