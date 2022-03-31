import prisma from "@/lib/prisma"

/**
 * Get Site
 * Fetches and returns either a single or all sites available dependin on
 * whether a 'siteId' query parameter is provided. If not all sites are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
import type { NextApiRequest, NextApiResponse } from "next"
import type { Site } from ".prisma/client"
import type { Session } from "next-auth"

export async function getSite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Array<Site> | (Site | null)>> {
  const { siteId } = req.query

  if (Array.isArray(siteId))
    return res.status(400).end("Bad Request. siteId parameter cannto be array")

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID")

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

    const sites = await prisma.site.findMany({
      where: {
        user: {
          id: session.user.id
        }
      }
    })

    return res.status(200).json(sites)
  } catch (error) {
    console.error(error)
    return res.status(500).end(error)
  }
}
