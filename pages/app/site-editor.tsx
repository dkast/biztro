import useSite from "@/hooks/useSite"
import { Editor, Element, Frame } from "@craftjs/core"
import { ArrowRightIcon } from "@heroicons/react/outline"
import lz from "lzutf8"
import type { GetServerSideProps, NextPage } from "next"
import absoluteUrl from "next-absolute-url"
import { useSession } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import { useRecoilValue, useSetRecoilState } from "recoil"

import Button from "@/components/Button"
import EditorSync from "@/components/editor/EditorSync"
import { RenderNode } from "@/components/editor/RenderNode"
import SettingsBar from "@/components/editor/SettingsBar"
import ToolbarMenu from "@/components/editor/ToolbarMenu"
import Toolbox from "@/components/editor/Toolbox"
import EmptyState from "@/components/EmptyState"
import Layout from "@/components/layouts/Layout"
import Loader from "@/components/Loader"
import Container from "@/components/selectors/Container"
import MenuBanner from "@/components/selectors/MenuBanner"
import MenuItem from "@/components/selectors/MenuItem"
import Text from "@/components/selectors/Text"

import classNames from "@/lib/classnames"
import { frameSizeState, hostState } from "@/lib/store"
import { frameSize, NextPageWithAuthAndLayout } from "@/lib/types"

type Props = {
  host: string | null
}

type NextPageWithAuthAndLayoutAndProps = NextPage<Props> &
  NextPageWithAuthAndLayout

const SiteEditor: NextPageWithAuthAndLayoutAndProps = props => {
  // Hooks
  const { data: session } = useSession()
  const sessionId = session?.user?.id
  const { site, error } = useSite(sessionId)

  // Atoms
  const setHost = useSetRecoilState(hostState)
  const size = useRecoilValue(frameSizeState)

  const { host } = props
  setHost(host)

  // Load state
  let json = undefined
  if (site?.serialData) {
    json = lz.decompress(lz.decodeBase64(site.serialData))
  }

  const isSiteLoading = typeof site === "undefined" && !error
  if (isSiteLoading) {
    return <Loader />
  }

  if (!isSiteLoading && !site) {
    return (
      <EmptyState
        header="No hay información del sitio"
        description="Agrega la información básica de tu sitio."
        imageURL="/placeholder-store.svg"
        primaryAction={
          <Link href="/app/settings" legacyBehavior>
            <Button variant="primary" size="sm" rightIcon={<ArrowRightIcon />}>
              Ir a Ajustes
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <Head>
        <title>Biztro - Editor</title>
      </Head>
      <Editor
        resolver={{ Container, Text, MenuItem, MenuBanner }}
        onRender={RenderNode}
      >
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="flex min-h-0 flex-1 flex-nowrap">
            {/* Toolbox */}
            <div className="flex w-60 bg-white">
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
            <div className="flex w-60 bg-white">
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
