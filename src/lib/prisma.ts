import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"

import { env } from "@/env.mjs"

// Cast to any to avoid a type mismatch between different @libsql/client copies.
const adapter = new PrismaLibSQL({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
})
const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["info", "warn", "error"] : ["error"]
})

export default prisma
