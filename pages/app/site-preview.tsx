import React from "react"
import { useSession } from "next-auth/react"
import { Editor, Frame } from "@craftjs/core"
import lz from "lzutf8"

import useSite from "@/hooks/useSite"
import Loader from "@/components/Loader"
import Text from "@/components/selectors/Text"
import Container from "@/components/selectors/Container"
import MenuItem from "@/components/selectors/MenuItem"
import MenuBanner from "@/components/selectors/MenuBanner"

import { NextPageWithAuthAndLayout } from "@/lib/types"

const SitePreview: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site, isLoading } = useSite(sessionId)
  let json = undefined

  if (site?.serialData) {
    console.log("render menu")
    json = lz.decompress(lz.decodeBase64(site.serialData))
    console.dir(json)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center  justify-center">
        <Loader />
      </div>
    )
  }
  return (
    <Editor
      resolver={{ Container, Text, MenuItem, MenuBanner }}
      enabled={false}
    >
      <Frame data={json} />
    </Editor>
  )
}
SitePreview.auth = true
export default SitePreview
