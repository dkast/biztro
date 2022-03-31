import { getServerSession } from "next-auth"

import { getSite } from "@/lib/api/site"
import { authOptions } from "@/lib/auth"
import { HttpMethod } from "@/lib/types"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function site(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions)

  if (!session) return res.status(400).end()

  switch (req.method) {
    case HttpMethod.GET:
      return getSite(req, res, session)
    default:
      res.setHeader("Allow", [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.DELETE,
        HttpMethod.PUT
      ])
  }
}
