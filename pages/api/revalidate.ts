import { unstable_getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"

import type { NextApiRequest, NextApiResponse } from "next"

// API route that revalidates the `/site` static page
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  // If is not signed in, abort
  if (!session) return res.status(400).end()

  // Requires the site id
  const site = req.query.site
  if (!site) {
    return res
      .status(400)
      .json({ message: "Bad Request. site parameter is required." })
  }

  try {
    // ♻️ Regenerate the `/site` page and push the resulting static files to
    // the edge
    await res.revalidate(`/${site}`)

    return res.status(200).json({ revalidated: true })
  } catch (err) {
    // Note: Next.js will continue showing the last successfully generated page
    return res.status(500).json({ message: "Error revalidating" })
  }
}
