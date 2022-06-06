import React from "react"
import { NextSeo } from "next-seo"
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
  name: string
  description: string
  image: string
  serialData: string
}

const Site: NextPage<IndexProps> = ({
  name,
  description,
  image,
  serialData
}) => {
  const router = useRouter()
  const siteTitle = `${name} - Menu`
  let backgroundColor: Record<"r" | "g" | "b" | "a", number>

  if (router.isFallback)
    return (
      <div className="flex h-screen w-screen items-center  justify-center">
        <Loader />
      </div>
    )

  const json = lz.decompress(lz.decodeBase64(serialData))

  // Search container style (color)
  const data = JSON.parse(json)
  console.dir(data)
  let keys = Object.keys(data)
  keys.forEach(el => {
    let node = data[el]
    let { displayName } = node
    if (displayName === "Sitio") {
      console.dir(data[el])
      backgroundColor = data[el]?.props?.background
    }
  })

  return (
    <>
      <NextSeo
        title={siteTitle}
        description={description}
        openGraph={{
          title: siteTitle,
          description: description,
          images: [
            {
              url: image,
              width: 800,
              height: 600,
              type: "image/jpeg"
            }
          ]
        }}
      />
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

  const data = await prisma.site.findFirst({
    where: {
      id: site as string,
      published: true
    },
    select: {
      name: true,
      description: true,
      image: true,
      serialData: true
    }
  })

  if (!data) return { notFound: true, revalidate: 60 }

  return {
    props: {
      name: data.name,
      description: data.description,
      image: data.image,
      serialData: data.serialData
    }
  }
}

export default Site
