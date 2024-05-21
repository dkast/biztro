import { rgbaToHex, type RgbaColor } from "@uiw/react-color"
import lz from "lzutf8"
import { notFound } from "next/navigation"

import ResolveEditor from "@/app/[subdomain]/resolve-editor"
import { getMenuByOrgSubdomain } from "@/server/actions/menu/queries"

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
      className="min-h-screen"
    >
      <ResolveEditor json={json} />
      <p
        className="fixed bottom-0 left-0 w-full py-2 text-center text-xs"
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
