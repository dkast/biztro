import { createClient } from "@libsql/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"

import { env } from "@/env.mjs"

const libsql = createClient({
  url: `${env.TURSO_DATABASE_URL}`,
  authToken: `${env.TURSO_AUTH_TOKEN}`
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({
  adapter
  // log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
})

export default prisma
