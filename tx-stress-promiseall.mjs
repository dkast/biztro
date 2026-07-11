import { PrismaClient } from "./src/generated/prisma-client/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import "dotenv/config"
import { appendFileSync } from "fs"

const logPath = ".cursor/debug-fe465b.log"
function log(message, data) {
  appendFileSync(logPath, JSON.stringify({
    sessionId: "fe465b",
    runId: "post-fix-stress",
    hypothesisId: "A,D",
    location: "tx-stress-promiseall.mjs",
    message,
    data,
    timestamp: Date.now()
  }) + "\n")
}

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

async function one(i) {
  const t0 = Date.now()
  try {
    await Promise.all([
      prisma.menu.findMany({ take: 5 }),
      prisma.organization.findMany({ take: 1 }),
    ])
    const row = { i, ok: true, ms: Date.now() - t0 }
    log("Promise.all ok", row)
    return row
  } catch (e) {
    const row = { i, ok: false, ms: Date.now() - t0, err: String(e.message).slice(0, 120) }
    log("Promise.all fail", row)
    return row
  }
}

const parallel = await Promise.all(Array.from({ length: 12 }, (_, i) => one(i)))
const failed = parallel.filter(r => !r.ok).length
log("stress summary", { failed, total: parallel.length, maxMs: Math.max(...parallel.map(r => r.ms)) })
console.log(JSON.stringify({ failed, total: parallel.length, results: parallel }, null, 2))
await prisma.$disconnect()
