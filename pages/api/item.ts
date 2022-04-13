import { getServerSession } from "next-auth"

import { createItem, getItem, updateItem, deleteItem } from "@/lib/api/item"
import { authOptions } from "@/lib/auth"
import { HttpMethod } from "@/lib/types"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function item(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions)

  if (!session) return res.status(400).end()

  switch (req.method) {
    case HttpMethod.GET:
      return getItem(req, res, session)
    case HttpMethod.POST:
      return createItem(req, res)
    case HttpMethod.PUT:
      return updateItem(req, res)
    case HttpMethod.DELETE:
      return deleteItem(req, res)
    default:
      res.setHeader("Allow", [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.DELETE,
        HttpMethod.PUT
      ])
  }
}
