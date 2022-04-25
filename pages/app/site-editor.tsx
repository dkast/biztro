import Head from "next/head"
import { useSession } from "next-auth/react"
import { Editor, Frame, Element } from "@craftjs/core"

import useSite from "@/hooks/useSite"
import Loader from "@/components/Loader"
import Text from "@/components/selectors/Text"
import Layout from "@/components/layouts/Layout"
import Toolbox from "@/components/editor/Toolbox"
import Container from "@/components/selectors/Container"
import { NextPageWithAuthAndLayout } from "@/lib/types"
import { RenderNode } from "@/components/editor/RenderNode"
import SettingsBar from "@/components/editor/SettingsBar"
import MenuItem from "@/components/selectors/MenuItem"
import MenuBanner from "@/components/selectors/MenuBanner"

const SiteEditor: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site, isLoading } = useSite(sessionId)

  if (isLoading) {
    return <Loader />
  }

  return (
    <>
      <Head>
        <title>Bistro - Editor</title>
      </Head>
      <Editor
        resolver={{ Container, Text, MenuItem, MenuBanner }}
        onRender={RenderNode}
      >
        <div className="scro flex flex-1 flex-col bg-gray-100">
          {/* Toolbar */}
          <div className="h-12 border-b bg-white"></div>
          <div className="flex flex-1">
            {/* Toolbox */}
            <div className="w-60 border-r bg-white">
              <Toolbox />
            </div>
            {/* Content */}
            <div className="flex grow items-center justify-center py-8">
              <div className="page-container"></div>
              <div className="flex h-full max-h-[700px] w-[390px] overflow-scroll bg-white">
                <Frame>
                  <Element
                    is={Container}
                    canvas
                    custom={{ displayName: "Sitio" }}
                  >
                    <MenuBanner
                      site={site}
                      showLogo={true}
                      showBanner={true}
                    ></MenuBanner>
                  </Element>
                </Frame>
              </div>
            </div>
            {/* Settings */}
            <div className="flex w-60 border-l bg-white">
              <SettingsBar />
            </div>
          </div>
        </div>
      </Editor>
    </>
  )
}

SiteEditor.auth = true
SiteEditor.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default SiteEditor
