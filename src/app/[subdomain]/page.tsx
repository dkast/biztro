import type { RgbaColor } from "@uiw/react-color"
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
  if (siteMenu.serialData)
    json = lz.decompress(lz.decodeBase64(siteMenu.serialData))

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let backgroundColor: RgbaColor // skipcq: JS-0356

  // Search container style (color)
  const data = JSON.parse(json)
  const keys = Object.keys(data)
  keys.forEach(el => {
    const node = data[el]
    const { displayName } = node
    if (displayName === "Sitio") {
      backgroundColor = data[el]?.props?.background
    }
  })

  return (
    <>
      <ResolveEditor json={json} />
    </>
  )
}
