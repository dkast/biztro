const postmark = require("postmark")

import type { NextApiRequest, NextApiResponse } from "next"
import { HttpMethod } from "@/lib/types"

const client = new postmark.ServerClient(process.env.POSTMARK_API)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check the current request method
  if (req.method === HttpMethod.POST) {
    const { email } = req.body

    // Make sure email address is not empty
    if (!email || email === "") {
      return res.status(400).send("Invite not sent.")
    }

    try {
      const message = `El correo ${email} solicita acceso a la aplicacion.`

      await client.sendEmail({
        From: "invite@biztro.co",
        To: "hola@biztro.co",
        Subject: "Solicitud de Invitacion",
        TextBody: message,
        MessageStream: "broadcast"
      })

      return res.status(200).json({ message: "Message sent successfully." })
    } catch (err) {
      return res.status(500).json({ message: "Error sending invite." })
    }
  } else {
    res.setHeader("Allow", [HttpMethod.POST])
  }
}
