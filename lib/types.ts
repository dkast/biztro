import type { NextPage } from "next"
import React from "react"

export type NextPageWithAuthAndLayout = NextPage & {
  auth?: Boolean
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

export enum HttpMethod {
  CONNECT = "CONNECT",
  DELETE = "DELETE",
  GET = "GET",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  PATCH = "PATCH",
  POST = "POST",
  PUT = "PUT",
  TRACE = "TRACE"
}
