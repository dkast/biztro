import { createClient } from "@libsql/client"
const c = createClient({ url: "http://127.0.0.1:8080" })
const r = await c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Verification'")
console.log(r.rows.length ? "EXISTS" : "MISSING")
