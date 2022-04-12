import prisma from "@/lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import type { Item, Site } from "@prisma/client"
import type { Session } from "next-auth"

interface AllItems {
  items: Array<Item>
  site: Site | null
}

export async function getItem(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<AllItems | null>> {
  const { itemId, siteId } = req.query

  if (Array.isArray(itemId) || Array.isArray(siteId))
    return res.status(400).end("Bad request. Query parameters are not valid.")

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID.")

  try {
    if (itemId) {
      const item = await prisma.item.findFirst({
        where: {
          id: itemId,
          site: {
            user: {
              id: session.user.id
            }
          }
        }
      })

      return res.status(200).json(item)
    }

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        user: {
          id: session.user.id
        }
      }
    })

    const items = !site
      ? []
      : await prisma.item.findMany({
          where: {
            site: {
              id: siteId
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        })

    return res.status(200).json({
      items,
      site
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}

export async function createItem(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<{
  itemId: string
}>> {
  const { siteId } = req.query
  const { title, description, extras, price } = req.body

  if (Array.isArray(siteId))
    return res.status(400).end("Bad Request. siteId parameter cannto be array.")

  try {
    const response = await prisma.item.create({
      data: {
        title,
        description,
        extras,
        price,
        site: {
          connect: {
            id: siteId
          }
        }
      }
    })

    return res.status(201).json({
      itemId: response.id
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}

export async function deleteItem(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse> {
  const { itemId } = req.query

  if (Array.isArray(itemId))
    return res
      .status(400)
      .end("Bad request. itemId parameter cannot be an array.")

  try {
    const response = await prisma.item.delete({
      where: {
        id: itemId
      }
    })

    return res.status(200).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}

export async function updateItem(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<Item>> {
  const { id, title, description, extras, price, image, imageBlurhash } =
    req.body

  try {
    const item = await prisma.item.update({
      where: {
        id: id
      },
      data: {
        title,
        description,
        extras,
        price,
        image,
        imageBlurhash
      }
    })

    return res.status(200).json(item)
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}
