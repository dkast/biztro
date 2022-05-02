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
import ToolbarMenu from "@/components/editor/ToolbarMenu"

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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="flex min-h-0 flex-1 flex-nowrap">
            {/* Toolbox */}
            <div className="flex w-60 border-r bg-white">
              <Toolbox />
            </div>
            {/* Content */}
            <div className="page-container relative h-full grow">
              {/* Toolbar */}
              <div className="h-[45px] border-b bg-white">
                <ToolbarMenu />
              </div>
              <div className="absolute inset-0 overflow-auto">
                <div className="mx-auto my-16 flex min-h-[700px] w-[390px] bg-white">
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
