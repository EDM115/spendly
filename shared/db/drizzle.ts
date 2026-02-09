import Database from "better-sqlite3"

import { schema } from "#shared/db/schema"
import { drizzle } from "drizzle-orm/better-sqlite3"

const sqlite = new Database(process.env.DB_FILE_NAME)

sqlite.pragma("encoding = 'UTF-8'")
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("synchronous = NORMAL")
sqlite.pragma("temp_store = MEMORY")
sqlite.pragma("busy_timeout = 5000")
sqlite.pragma("foreign_keys = ON")

export const db = drizzle({
  client: sqlite,
  schema,
})

export default db
