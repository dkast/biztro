import { createClient } from "@libsql/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"

import { env } from "@/env.mjs"

const libsql = createClient({
  url: `${env.TURSO_DATABASE_URL}`,
  authToken: `${env.TURSO_AUTH_TOKEN}`
})

// Cast to any to avoid a type mismatch between different @libsql/client copies.
const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({
  adapter,
  log:
    env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"]
})

// In development, also print queries and their params/duration to the console.
if (env.NODE_ENV === "development") {
  // Use a narrow handler type to avoid `any` linting errors.
  const prismaWithOn = prisma as unknown as {
    $on: (
      event: string,
      handler: (e: {
        query?: string
        params?: string
        duration?: number
      }) => void
    ) => void
  }

  prismaWithOn.$on("query", e => {
    const q = e.query ?? ""
    const params = e.params
    const duration = typeof e.duration === "number" ? `${e.duration}ms` : "-"
    console.log(`[prisma] query (${duration}): ${q}`)
    if (params) console.log(`[prisma] params: ${params}`)
  })
}

export default prisma
