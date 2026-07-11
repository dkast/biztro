import { PrismaClient } from "./src/generated/prisma-client/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

async function oneTx(i) {
  const t0 = Date.now()
  try {
    await prisma.$transaction([
      prisma.menu.findMany({ take: 5 }),
      prisma.organization.findMany({ take: 1 }),
    ])
    return { i, ok: true, ms: Date.now() - t0 }
  } catch (e) {
    return { i, ok: false, ms: Date.now() - t0, err: e.message?.slice(0, 120) }
  }
}

console.log("URL", process.env.TURSO_DATABASE_URL)
console.log("serial x5...")
for (let i = 0; i < 5; i++) console.log(await oneTx(i))

console.log("parallel x8...")
console.log(await Promise.all(Array.from({ length: 8 }, (_, i) => oneTx(i))))

await prisma.$disconnect()
