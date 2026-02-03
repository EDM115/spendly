import Database from "better-sqlite3"

import { schema } from "#shared/db/schema"
import { drizzle } from "drizzle-orm/better-sqlite3"

const sqlite = new Database(process.env.DB_FILE_NAME)

sqlite.pragma("journal_mode = WAL")

export const db = drizzle({
  client: sqlite,
  schema,
})

export default db
