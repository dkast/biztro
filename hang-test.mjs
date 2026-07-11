import { PrismaClient } from "./src/generated/prisma-client/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

const orgs = await prisma.organization.findMany({ take: 1, select: { id: true } })
const orgId = orgs[0]?.id
console.log("org", orgId)

console.log("seq start")
const t0 = Date.now()
const menus = await prisma.menu.findMany({ where: { organizationId: orgId }, take: 5 })
const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { activeMenuId: true } })
console.log("seq ok", Date.now()-t0, menus.length, org?.activeMenuId)

console.log("parallel start")
const t1 = Date.now()
const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT 8s")), 8000))
try {
  await Promise.race([
    Promise.all([
      prisma.menu.findMany({ where: { organizationId: orgId }, take: 5 }),
      prisma.organization.findUnique({ where: { id: orgId }, select: { activeMenuId: true } }),
    ]),
    timeout,
  ])
  console.log("parallel ok", Date.now()-t1)
} catch (e) {
  console.log("parallel FAIL", e.message, Date.now()-t1)
}
await prisma.$disconnect()
