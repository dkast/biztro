import { rgbaToHex, type RgbaColor } from "@uiw/react-color"
import lz from "lzutf8"
import type { Metadata, ResolvingMetadata } from "next"
import { type Viewport } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import ResolveEditor from "@/app/[subdomain]/resolve-editor"
import { getMenuByOrgSubdomain } from "@/server/actions/menu/queries"
import { getOrganizationBySubdomain } from "@/server/actions/organization/queries"
import { SubscriptionStatus } from "@/lib/types"

export async function generateMetadata(
  {
    params
  }: {
    params: { subdomain: string }
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const org = await getOrganizationBySubdomain(params.subdomain)

  if (
    org &&
    (org.status === SubscriptionStatus.ACTIVE ||
      org.status === SubscriptionStatus.TRIALING)
  ) {
    const description =
      org.description && org.description.length > 0
        ? org.description
        : (await parent).description
    return {
      title: org.name,
      description
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
      className="relative flex min-h-screen flex-col"
    >
      <div className="flex grow">
        <ResolveEditor json={json} />
      </div>
      <div
        className="fixed inset-x-0 bottom-0 flex items-center justify-between gap-x-4 p-2 text-xs"
        style={{
          color: `${rgbaToHex(textColor)}`
        }}
      >
        <div>
          Últ. actualiazión:{" "}
          {siteMenu.publishedAt
            ? new Intl.DateTimeFormat("es-MX", {
                year: "numeric",
                month: "short",
                day: "numeric"
              }).format(new Date(siteMenu.publishedAt))
            : ""}
        </div>
        <Link href="https://biztro.co" target="_blank">
          <div className="flex items-center justify-center gap-x-2 rounded-full bg-black/50 px-3 py-1">
            <Image
              src="/safari-pinned-tab.svg"
              alt="Logo"
              width={12}
              height={12}
              className="opacity-90 invert"
            />
            <span className="text-xs text-gray-100">
              <em className="hidden not-italic sm:inline">Powered by </em>Biztro
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
