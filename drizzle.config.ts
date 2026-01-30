import dotenvx from "@dotenvx/dotenvx"

import { defineConfig } from "drizzle-kit"

dotenvx.config()

export default defineConfig({
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
  dialect: "sqlite",
  out: "./drizzle",
  schema: "./shared/db/schema.ts",
})
