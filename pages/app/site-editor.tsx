import Head from "next/head"
import { useSession } from "next-auth/react"
import { Editor, Frame, Element, useEditor } from "@craftjs/core"
import { useRecoilValue, useSetRecoilState } from "recoil"
import lz from "lzutf8"

import useSite from "@/hooks/useSite"
import useItems from "@/hooks/useItems"
import Loader from "@/components/Loader"
import classNames from "@/lib/classnames"
import absoluteUrl from "next-absolute-url"
import { frameSizeState, hostState, syncReqState } from "@/lib/store"
import Text from "@/components/selectors/Text"
import Layout from "@/components/layouts/Layout"
import Toolbox from "@/components/editor/Toolbox"
import Container from "@/components/selectors/Container"
import { RenderNode } from "@/components/editor/RenderNode"
import SettingsBar from "@/components/editor/SettingsBar"
import MenuItem from "@/components/selectors/MenuItem"
import MenuBanner from "@/components/selectors/MenuBanner"
import ToolbarMenu from "@/components/editor/ToolbarMenu"
import EditorSync from "@/components/editor/EditorSync"

import { frameSize, HttpMethod } from "@/lib/types"
import { NextPageWithAuthAndLayout } from "@/lib/types"
import type { GetServerSideProps, NextPage } from "next"

type Props = {
  host: string | null
}

type NextPageWithAuthAndLayoutAndProps = NextPage<Props> &
  NextPageWithAuthAndLayout

const SiteEditor: NextPageWithAuthAndLayoutAndProps = props => {
  // Hooks
  const { data: session } = useSession()
  const sessionId = session?.user?.id
  const { site, isLoading } = useSite(sessionId)

  // Atoms
  const setHost = useSetRecoilState(hostState)
  const synReq = useRecoilValue(syncReqState)
  const size = useRecoilValue(frameSizeState)

  setHost(props.host)

  // Load state
  let json = undefined
  if (site?.serialData) {
    json = lz.decompress(lz.decodeBase64(site.serialData))
  }

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
              <div className="z-30 h-[45px] border-b bg-white">
                <ToolbarMenu />
              </div>
              <div className="absolute inset-0 mt-[45px] overflow-auto py-8">
                <EditorSync />
                <div
                  className={classNames(
                    size === frameSize.MOBILE ? "w-[390px]" : "w-[1024px]",
                    "mx-auto flex min-h-[700px] bg-white"
                  )}
                >
                  <Frame data={json}>
                    <Element
                      is={Container}
                      canvas
                      custom={{ displayName: "Sitio" }}
                    >
                      <MenuBanner site={site} showLogo showBanner></MenuBanner>
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

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const { origin } = absoluteUrl(context.req)

  return {
    props: {
      host: origin
    }
  }
}

SiteEditor.auth = true
SiteEditor.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default SiteEditor
