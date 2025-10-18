import path from "path"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import type { PrismaConfig } from "prisma"

import "dotenv/config"

export default {
  experimental: {
    adapter: true
  },
  schema: path.join("prisma"),
  async adapter() {
    return new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    })
  }
} satisfies PrismaConfig
