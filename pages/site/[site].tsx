import React from "react"
import { useRouter } from "next/router"
import { Editor, Frame } from "@craftjs/core"
import lz from "lzutf8"

import prisma from "@/lib/prisma"
import Loader from "@/components/Loader"

import type { GetStaticPaths, GetStaticProps, NextPage } from "next"
import type { ParsedUrlQuery } from "querystring"
import Text from "@/components/selectors/Text"
import Container from "@/components/selectors/Container"
import MenuItem from "@/components/selectors/MenuItem"
import MenuBanner from "@/components/selectors/MenuBanner"

interface PathProps extends ParsedUrlQuery {
  site: string
}

interface IndexProps {
  serialData: string
}

const Site: NextPage<IndexProps> = ({ serialData }) => {
  const router = useRouter()

  if (router.isFallback)
    return (
      <div className="flex h-screen w-screen items-center  justify-center">
        <Loader />
      </div>
    )

  const json = lz.decompress(lz.decodeBase64(serialData))

  return (
    <div className="flex flex-col">
      <div className="relative grow h-screen-safe sm:h-screen">
        <div className="absolute inset-0 overflow-auto pb-4">
          <Editor
            resolver={{ Container, Text, MenuItem, MenuBanner }}
            enabled={false}
          >
            <Frame data={json} />
          </Editor>
        </div>
      </div>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const sites = await prisma.site.findMany({
    select: {
      id: true
    }
  })

  const paths = sites.map(site => ({
    params: { site: site.id }
  }))

  return {
    paths,
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<IndexProps, PathProps> = async ({
  params
}) => {
  if (!params) throw new Error("No path parameters found")

  const { site } = params

  const data = await prisma.site.findUnique({
    where: {
      id: site as string
    },
    select: {
      serialData: true
    }
  })

  if (!data) return { notFound: true, revalidate: 60 }

  return {
    props: {
      serialData: data.serialData
    },
    revalidate: 900
  }
}

export default Site
