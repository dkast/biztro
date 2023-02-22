import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from "next-auth/next"

import { createSite, getSite, updateSite } from "@/lib/api/site"
import { authOptions } from "@/lib/auth"
import { HttpMethod } from "@/lib/types"

export default async function site(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) return res.status(400).end()

  switch (req.method) {
    case HttpMethod.GET:
      return getSite(req, res, session)
    case HttpMethod.POST:
      return createSite(req, res)
    case HttpMethod.PUT:
      return updateSite(req, res)
    default:
      res.setHeader("Allow", [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.DELETE,
        HttpMethod.PUT
      ])
  }
}
