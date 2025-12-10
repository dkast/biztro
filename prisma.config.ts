import path from "path"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: path.join("prisma"),
  datasource: {
    // Use process.env with fallback for prisma generate (which doesn't need a DB connection)
    url: process.env.LOCAL_DATABASE_URL ?? "file:./local.db"
  }
})
