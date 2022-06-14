import cuid from "cuid"
import prisma from "@/lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import type { Site } from "@prisma/client"
import type { Session } from "next-auth"

export async function getSite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Array<Site> | (Site | null)>> {
  const { siteId } = req.query

  if (Array.isArray(siteId))
    return res.status(400).end("Bad Request. siteId parameter cannto be array.")

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID.")

  try {
    if (siteId) {
      const site = await prisma.site.findFirst({
        where: {
          id: siteId,
          user: {
            id: session.user.id
          }
        }
      })

      return res.status(200).json(site)
    }

    // Brings only one site, in the future a User could have multiple sites
    const site = await prisma.site.findFirst({
      where: {
        user: {
          id: session.user.id
        }
      }
    })

    return res.status(200).json(site)
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}

export async function createSite(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<{ siteId: string }>> {
  const { name, subdomain, description, phone, userId } = req.body

  try {
    const response = await prisma.site.create({
      data: {
        name,
        subdomain: subdomain.length > 0 ? subdomain : cuid(),
        description,
        phone,
        user: {
          connect: {
            id: userId
          }
        }
      }
    })

    return res.status(201).json({
      siteId: response.id
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}

export async function updateSite(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<Site>> {
  const {
    id,
    name,
    subdomain,
    description,
    phone,
    logo,
    image,
    imageBlurhash,
    serialData,
    published
  } = req.body

  try {
    const response = await prisma.site.update({
      where: {
        id: id
      },
      data: {
        name,
        subdomain: subdomain.length > 0 ? subdomain : cuid(),
        description,
        phone,
        logo,
        image,
        imageBlurhash,
        serialData,
        published
      }
    })

    return res.status(200).json(response)
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}
