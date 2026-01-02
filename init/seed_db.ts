import type { User } from "./app/types"

import Database from "better-sqlite3"

import { hash } from "bcryptjs"
import { randomUUID } from "node:crypto"
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
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
  `)
    .run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS BudgetTracker (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL
    );
  `)
    .run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS UserBudgetTracker (
      user_id TEXT NOT NULL,
      budget_tracker_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      PRIMARY KEY (user_id, budget_tracker_id),
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (budget_tracker_id) REFERENCES BudgetTracker(id) ON DELETE CASCADE
    );
  `)
    .run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    );
  `)
    .run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS Spending (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      budget_tracker_id TEXT NOT NULL,
      value REAL NOT NULL,
      is_spending INTEGER NOT NULL DEFAULT 1,
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (budget_tracker_id) REFERENCES BudgetTracker(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE
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
  let users: Array<Omit<User, "id">>

  try {
    users = JSON.parse(raw)
  } catch (e) {
    console.error("❌ failed to parse SEED_USERS :", e)
    users = []
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO User (id, username, password, role)
    VALUES (?, ?, ?, ?)
  `)

  await Promise.all(users.map(async ({
    username, password, role,
  }) => {
    const id = randomUUID()
    const hashed = await hash(password, SALT_ROUNDS)

    insert.run(id, username, hashed, role)
    console.log(`Seeded user : ${username}`)
  }))

  console.log("\n✅ User seeding completed\n")
}

async function main() {
  if (process.env.SEED === "true") {
    const db = initDatabase()

    try {
      await seedUsers(db)
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
