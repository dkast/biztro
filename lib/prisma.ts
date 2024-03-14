import { createClient } from "@libsql/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"

import { env } from "@/env.mjs"

const libsql = createClient({
  url: `${env.DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

export default prisma
