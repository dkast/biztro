import React from "react"

import prisma from "@/lib/prisma"

import type { GetStaticPaths } from "next"
import type { ParsedUrlQuery } from "querystring"

interface PathProps extends ParsedUrlQuery {
  id: string
}

const Site = () => {
  return <div>Site</div>
}

// export const getStaticPaths: GetStaticPaths<PathProps> = async() => {
//   const sites = await prisma.site.findMany({
//     select: {
//       id: true
//     }
//   })

//   const paths = sites.map((site) => {
//     params: { id: site.id }
//   })

//   return {
//     paths, fallback: true
//   }
// }

export default Site
