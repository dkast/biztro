import { PrismaLibSQL } from "@prisma/adapter-libsql"

import { env } from "@/env.mjs"
import { PrismaClient } from "../../prisma/generated/prisma-client/client"

const adapter = new PrismaLibSQL({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
})
const prisma = new PrismaClient({
  adapter
  // log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
})

export default prisma
