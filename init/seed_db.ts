import Database from "better-sqlite3"

import { hash } from "bcryptjs"
import { mkdirSync } from "node:fs"
import {
  dirname,
  resolve,
} from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_PATH = resolve(__dirname, "../db/data.db")
const SALT_ROUNDS = 10

function initDatabase() {
  mkdirSync(dirname(DB_PATH), { recursive: true })

  const db = new Database(DB_PATH)

  db.pragma("journal_mode = WAL")

  db.prepare(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
  `)
    .run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS Icon (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `)
    .run()

  console.log("\n✅ Database initialized\n")

  return db
}

async function seedUsers(db: Database.Database) {
  const raw = process.env.SEED_USERS
    ?.replace("\\'", "'")
    .replace("\\\"", "\"") || "[]"
  let users: Array<{
    username: string; password: string; role: string;
  }>

  try {
    users = JSON.parse(raw)
  } catch (e) {
    console.error("❌ failed to parse SEED_USERS :", e)
    users = []
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO User (username, password, role)
    VALUES (?, ?, ?)
  `)

  await Promise.all(users.map(async ({
    username, password, role,
  }) => {
    const hashed = await hash(password, SALT_ROUNDS)

    insert.run(username, hashed, role)
    console.log(`Seeded user : ${username}`)
  }))

  console.log("\n✅ User seeding completed\n")
}

async function seedIcons(db: Database.Database) {
  const raw = process.env.SEED_ICONS || "[]"
  let icons: Array<{
    name: string; color: string; icon: string;
  }>

  try {
    icons = JSON.parse(raw)
  } catch (e) {
    console.error("❌ failed to parse SEED_ICONS :", e)
    icons = []
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO Icon (name, color, icon)
    VALUES (?, ?, ?)
  `)

  await Promise.all(icons.map(async ({
    name, color, icon,
  }) => {
    insert.run(name, color, icon)
    console.log(`Seeded icon : ${name}`)
  }))

  console.log("\n✅ Icon seeding completed\n")
}

async function main() {
  if (process.env.SEED === "true") {
    const db = initDatabase()

    try {
      await seedUsers(db)
      await seedIcons(db)
    } catch (e) {
      console.error("❌ Error seeding database :", e)
    } finally {
      db.close()
    }
    console.log("✅ Database initialized and seeded")
  } else {
    console.log("❌ Skipping database initialization")
  }
}

await main()
