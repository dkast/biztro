import { createClient } from "@libsql/client"
const c = createClient({ url: "http://127.0.0.1:8080" })
const r = await c.execute("SELECT id, email, enabled FROM Waitlist")
console.log(r.rows)
