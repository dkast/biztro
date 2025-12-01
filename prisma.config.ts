import path from "path"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: path.join("prisma"),
  datasource: {
    url: env("TURSO_DATABASE_URL")
  }
})
