import useSite from "@/hooks/useSite"
import { Editor, Frame } from "@craftjs/core"
import lz from "lzutf8"
import { useSession } from "next-auth/react"
import Head from "next/head"
import React from "react"

import Loader from "@/components/Loader"
import Container from "@/components/selectors/Container"
import MenuBanner from "@/components/selectors/MenuBanner"
import MenuItem from "@/components/selectors/MenuItem"
import Text from "@/components/selectors/Text"

import { NextPageWithAuthAndLayout } from "@/lib/types"

const SitePreview: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession()
  const sessionId = session?.user?.id
  let backgroundColor: Record<"r" | "g" | "b" | "a", number>

  const { site, isLoading } = useSite(sessionId)
  let json = undefined

  if (site?.serialData) {
    json = lz.decompress(lz.decodeBase64(site.serialData))

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
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center  justify-center">
        <Loader />
      </div>
    )
  }
  return (
    <>
      <Head>
        <title>Biztro - Vista Previa</title>
      </Head>
      <div className="bg-zinc-900 py-2 text-center text-zinc-300">
        <span>Vista Previa</span>
      </div>
      <div
        className="relative grow overflow-auto h-screen-safe sm:h-screen"
        style={{
          backgroundColor: `rgba(${Object.values(backgroundColor)})`
        }}
      >
        <Editor
          resolver={{ Container, Text, MenuItem, MenuBanner }}
          enabled={false}
        >
          <Frame data={json} />
        </Editor>
      </div>
    </>
  )
}
SitePreview.auth = true
export default SitePreview
