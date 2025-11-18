import path from "path"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  experimental: {
    adapter: true
  },
  schema: path.join("prisma"),
  async adapter() {
    return new PrismaLibSQL({
      url: env("TURSO_DATABASE_URL"),
      authToken: env("TURSO_AUTH_TOKEN")
    })
  }
})
