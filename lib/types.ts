import type { NextPage } from "next"
import React from "react"

export type NextPageWithAuthAndLayout = NextPage & {
  auth?: Boolean
  getLayout?: (page: React.ReactElement) => React.ReactNode
}
