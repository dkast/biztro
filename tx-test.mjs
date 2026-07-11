import { PrismaClient } from "./src/generated/prisma-client/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

console.log("simple...", await prisma.menu.count())
try {
  const r = await prisma.$transaction([prisma.menu.findMany({ take: 1 })])
  console.log("tx OK", r[0].length)
} catch (e) {
  console.log("tx FAIL:", e.message)
}
await prisma.$disconnect()
