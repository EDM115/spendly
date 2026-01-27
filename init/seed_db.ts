import type {
  BudgetTracker,
  DemoUserEnv,
  SeedUser,
  User,
} from "../shared/types/main"

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
      color TEXT NOT NULL,
      budget_tracker_id TEXT NOT NULL,
      FOREIGN KEY (budget_tracker_id) REFERENCES BudgetTracker(id) ON DELETE CASCADE
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
  let users: Array<SeedUser> = []

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

async function getOrCreateUser(
  db: Database.Database,
  username: string,
  password: string,
  role: string,
) {
  const existing = db
    .prepare<[string], User>("SELECT id FROM User WHERE username = ?")
    .get(username)

  if (existing?.id) {
    return existing.id
  }

  const id = randomUUID()
  const hashed = await hash(password, SALT_ROUNDS)

  db.prepare("INSERT INTO User (id, username, password, role) VALUES (?, ?, ?, ?)")
    .run(
      id,
      username,
      hashed,
      role,
    )

  return id
}

function getOrCreateBudgetTracker(db: Database.Database, name: string) {
  const existing = db
    .prepare<[string], BudgetTracker>("SELECT id FROM BudgetTracker WHERE name = ?")
    .get(name)

  if (existing?.id) {
    return existing.id
  }

  const id = randomUUID()

  db.prepare("INSERT INTO BudgetTracker (id, name) VALUES (?, ?)")
    .run(id, name)

  return id
}

async function seedDemoData(db: Database.Database) {
  const rawDemoUser = process.env.DEMO_USER?.replace("\\'", "'")
    .replace("\\\"", "\"")

  if (!rawDemoUser) {
    console.log("ℹ️  DEMO_USER not provided, skipping demo seeding")

    return
  }

  let demoUser: DemoUserEnv | null = null

  try {
    demoUser = JSON.parse(rawDemoUser)
  } catch (e) {
    console.error("❌ failed to parse DEMO_USER :", e)
    demoUser = null
  }

  if (!demoUser?.username || !demoUser?.password) {
    console.error("❌ DEMO_USER must include username and password")

    return
  }

  const ownerId = await getOrCreateUser(db, demoUser.username, demoUser.password, "user")
  const viewerId = await getOrCreateUser(db, "demo", "!Demo_User0§", "user")
  const demoTrackerName = "Spendly Demo"
  const demoTrackerId = getOrCreateBudgetTracker(db, demoTrackerName)

  db.prepare("INSERT OR REPLACE INTO UserBudgetTracker (user_id, budget_tracker_id, role) VALUES (?, ?, ?)")
    .run(ownerId, demoTrackerId, "owner")
  db.prepare("INSERT OR REPLACE INTO UserBudgetTracker (user_id, budget_tracker_id, role) VALUES (?, ?, ?)")
    .run(viewerId, demoTrackerId, "viewer")

  db.prepare("DELETE FROM Spending WHERE budget_tracker_id = ?")
    .run(demoTrackerId)
  db.prepare("DELETE FROM Category WHERE budget_tracker_id = ?")
    .run(demoTrackerId)

  const demoCategories = [
    {
      name: "Salary",
      icon: "mdi-cash-multiple",
      color: "#2E7D32",
      entries: [
        {
          name: "Salary payment",
          value: 1950,
          is_spending: 0,
          date: "2025-11-02",
        },
        {
          name: "Salary payment",
          value: 1950,
          is_spending: 0,
          date: "2025-12-02",
        },
        {
          name: "Salary payment",
          value: 1950,
          is_spending: 0,
          date: "2026-01-02",
        },
        {
          name: "Salary payment",
          value: 2150,
          is_spending: 0,
          date: "2026-02-02",
        },
        {
          name: "Salary payment",
          value: 2150,
          is_spending: 0,
          date: "2026-03-02",
        },
        {
          name: "Salary payment",
          value: 2150,
          is_spending: 0,
          date: "2026-04-02",
        },
        {
          name: "Salary payment",
          value: 2150,
          is_spending: 0,
          date: "2026-05-02",
        },
        {
          name: "Salary payment",
          value: 2150,
          is_spending: 0,
          date: "2026-06-02",
        },
        {
          name: "Salary payment",
          value: 2150,
          is_spending: 0,
          date: "2026-07-02",
        },
        {
          name: "Salary payment",
          value: 2150,
          is_spending: 0,
          date: "2026-08-02",
        },
      ],
    },
    {
      name: "Side income",
      icon: "mdi-cash-plus",
      color: "#26A69A",
      entries: [
        {
          name: "Santa gift",
          value: 200,
          is_spending: 0,
          date: "2025-12-25",
        },
        {
          name: "Yearly bonus",
          value: 800,
          is_spending: 0,
          date: "2026-01-01",
        },
        {
          name: "Lottery win",
          value: 50,
          is_spending: 0,
          date: "2026-03-11",
        },
        {
          name: "Second-hand sale",
          value: 75,
          is_spending: 0,
          date: "2026-04-18",
        },
        {
          name: "Second-hand sale",
          value: 120,
          is_spending: 0,
          date: "2026-06-09",
        },
      ],
    },
    {
      name: "Rent",
      icon: "mdi-home-city-outline",
      color: "#7E57C2",
      entries: [
        {
          name: "November rent",
          value: 1200,
          is_spending: 1,
          date: "2025-11-03",
        },
        {
          name: "December rent",
          value: 1200,
          is_spending: 1,
          date: "2025-12-03",
        },
        {
          name: "January rent",
          value: 1210,
          is_spending: 1,
          date: "2026-01-03",
        },
        {
          name: "February rent",
          value: 1210,
          is_spending: 1,
          date: "2026-02-03",
        },
        {
          name: "March rent",
          value: 1220,
          is_spending: 1,
          date: "2026-03-03",
        },
        {
          name: "April rent",
          value: 1220,
          is_spending: 1,
          date: "2026-04-03",
        },
        {
          name: "May rent",
          value: 1230,
          is_spending: 1,
          date: "2026-05-03",
        },
        {
          name: "June rent",
          value: 1230,
          is_spending: 1,
          date: "2026-06-03",
        },
        {
          name: "July rent",
          value: 1240,
          is_spending: 1,
          date: "2026-07-03",
        },
        {
          name: "August rent",
          value: 1240,
          is_spending: 1,
          date: "2026-08-03",
        },
      ],
    },
    {
      name: "Groceries",
      icon: "mdi-cart-variant",
      color: "#43A047",
      entries: [
        {
          name: "Weekly groceries",
          value: 95,
          is_spending: 1,
          date: "2025-11-10",
        },
        {
          name: "Market restock",
          value: 88,
          is_spending: 1,
          date: "2025-11-24",
        },
        {
          name: "Holiday groceries",
          value: 110,
          is_spending: 1,
          date: "2025-12-08",
        },
        {
          name: "Pantry fill",
          value: 102,
          is_spending: 1,
          date: "2025-12-22",
        },
        {
          name: "Pantry restock",
          value: 98,
          is_spending: 1,
          date: "2026-01-12",
        },
        {
          name: "Weekly groceries",
          value: 90,
          is_spending: 1,
          date: "2026-01-26",
        },
        {
          name: "Weekly groceries",
          value: 97,
          is_spending: 1,
          date: "2026-02-09",
        },
        {
          name: "Bulk groceries",
          value: 120,
          is_spending: 1,
          date: "2026-03-09",
        },
        {
          name: "Fresh produce",
          value: 104,
          is_spending: 1,
          date: "2026-04-13",
        },
        {
          name: "Farmers market",
          value: 105,
          is_spending: 1,
          date: "2026-05-14",
        },
        {
          name: "Family groceries",
          value: 112,
          is_spending: 1,
          date: "2026-06-12",
        },
        {
          name: "Summer groceries",
          value: 108,
          is_spending: 1,
          date: "2026-07-16",
        },
        {
          name: "Summer groceries",
          value: 115,
          is_spending: 1,
          date: "2026-08-11",
        },
      ],
    },
    {
      name: "Utilities",
      icon: "mdi-flash",
      color: "#FB8C00",
      entries: [
        {
          name: "Electricity bill",
          value: 140,
          is_spending: 1,
          date: "2025-11-15",
        },
        {
          name: "Internet bill",
          value: 55,
          is_spending: 1,
          date: "2025-11-28",
        },
        {
          name: "Electricity bill",
          value: 150,
          is_spending: 1,
          date: "2025-12-15",
        },
        {
          name: "Electricity bill",
          value: 142,
          is_spending: 1,
          date: "2026-01-15",
        },
        {
          name: "Electricity bill",
          value: 135,
          is_spending: 1,
          date: "2026-02-15",
        },
        {
          name: "Water bill",
          value: 48,
          is_spending: 1,
          date: "2026-02-28",
        },
        {
          name: "Electricity bill",
          value: 145,
          is_spending: 1,
          date: "2026-03-15",
        },
        {
          name: "Electricity bill",
          value: 148,
          is_spending: 1,
          date: "2026-04-15",
        },
        {
          name: "Electricity bill",
          value: 152,
          is_spending: 1,
          date: "2026-05-15",
        },
        {
          name: "Electricity bill",
          value: 160,
          is_spending: 1,
          date: "2026-06-15",
        },
        {
          name: "Electricity bill",
          value: 155,
          is_spending: 1,
          date: "2026-07-15",
        },
        {
          name: "Electricity bill",
          value: 158,
          is_spending: 1,
          date: "2026-08-15",
        },
      ],
    },
    {
      name: "Transport",
      icon: "mdi-train-car",
      color: "#1E88E5",
      entries: [
        {
          name: "Transit pass",
          value: 60,
          is_spending: 1,
          date: "2025-11-20",
        },
        {
          name: "Transit pass",
          value: 65,
          is_spending: 1,
          date: "2025-12-20",
        },
        {
          name: "Fuel refill",
          value: 45,
          is_spending: 1,
          date: "2026-01-08",
        },
        {
          name: "Transit pass",
          value: 58,
          is_spending: 1,
          date: "2026-02-20",
        },
        {
          name: "Bike repair",
          value: 80,
          is_spending: 1,
          date: "2026-03-05",
        },
        {
          name: "Transit pass",
          value: 70,
          is_spending: 1,
          date: "2026-04-20",
        },
        {
          name: "Ride share",
          value: 22,
          is_spending: 1,
          date: "2026-05-09",
        },
        {
          name: "Train tickets",
          value: 48,
          is_spending: 1,
          date: "2026-06-18",
        },
        {
          name: "Transit pass",
          value: 64,
          is_spending: 1,
          date: "2026-07-21",
        },
        {
          name: "Transit pass",
          value: 64,
          is_spending: 1,
          date: "2026-08-20",
        },
      ],
    },
    {
      name: "Dining out",
      icon: "mdi-silverware-fork-knife",
      color: "#E53935",
      entries: [
        {
          name: "Cafe lunch",
          value: 45,
          is_spending: 1,
          date: "2025-11-22",
        },
        {
          name: "Dinner with friends",
          value: 52,
          is_spending: 1,
          date: "2025-12-05",
        },
        {
          name: "Pizza night",
          value: 35,
          is_spending: 1,
          date: "2025-12-19",
        },
        {
          name: "Weekend brunch",
          value: 60,
          is_spending: 1,
          date: "2026-01-18",
        },
        {
          name: "Valentine dinner",
          value: 70,
          is_spending: 1,
          date: "2026-02-14",
        },
        {
          name: "Taco Tuesday",
          value: 42,
          is_spending: 1,
          date: "2026-03-27",
        },
        {
          name: "Late-night snack",
          value: 48,
          is_spending: 1,
          date: "2026-04-02",
        },
        {
          name: "Ramen bowl",
          value: 58,
          is_spending: 1,
          date: "2026-05-23",
        },
        {
          name: "Bistro dinner",
          value: 46,
          is_spending: 1,
          date: "2026-06-30",
        },
        {
          name: "Sushi night",
          value: 55,
          is_spending: 1,
          date: "2026-07-26",
        },
        {
          name: "Gelato stop",
          value: 40,
          is_spending: 1,
          date: "2026-08-12",
        },
      ],
    },
    {
      name: "Health & fitness",
      icon: "mdi-heart-pulse",
      color: "#D81B60",
      entries: [
        {
          name: "Gym membership",
          value: 35,
          is_spending: 1,
          date: "2025-11-12",
        },
        {
          name: "Gym membership",
          value: 35,
          is_spending: 1,
          date: "2025-12-12",
        },
        {
          name: "Pharmacy",
          value: 24,
          is_spending: 1,
          date: "2026-01-10",
        },
        {
          name: "Gym membership",
          value: 35,
          is_spending: 1,
          date: "2026-02-12",
        },
        {
          name: "Dental check",
          value: 85,
          is_spending: 1,
          date: "2026-03-06",
        },
        {
          name: "Gym membership",
          value: 35,
          is_spending: 1,
          date: "2026-04-12",
        },
        {
          name: "Gym membership",
          value: 35,
          is_spending: 1,
          date: "2026-05-12",
        },
        {
          name: "Health checkup",
          value: 60,
          is_spending: 1,
          date: "2026-06-04",
        },
        {
          name: "Gym membership",
          value: 35,
          is_spending: 1,
          date: "2026-07-12",
        },
        {
          name: "Gym membership",
          value: 35,
          is_spending: 1,
          date: "2026-08-12",
        },
      ],
    },
    {
      name: "Entertainment",
      icon: "mdi-movie-open-outline",
      color: "#8E24AA",
      entries: [
        {
          name: "Streaming rental",
          value: 30,
          is_spending: 1,
          date: "2025-11-28",
        },
        {
          name: "Holiday concert",
          value: 75,
          is_spending: 1,
          date: "2025-12-26",
        },
        {
          name: "Board games",
          value: 28,
          is_spending: 1,
          date: "2026-01-25",
        },
        {
          name: "Movie night",
          value: 28,
          is_spending: 1,
          date: "2026-02-05",
        },
        {
          name: "Museum entry",
          value: 22,
          is_spending: 1,
          date: "2026-03-20",
        },
        {
          name: "Comedy show",
          value: 50,
          is_spending: 1,
          date: "2026-04-20",
        },
        {
          name: "Local festival",
          value: 45,
          is_spending: 1,
          date: "2026-05-06",
        },
        {
          name: "Escape room",
          value: 40,
          is_spending: 1,
          date: "2026-06-17",
        },
        {
          name: "Arcade night",
          value: 35,
          is_spending: 1,
          date: "2026-07-10",
        },
        {
          name: "Beach day",
          value: 18,
          is_spending: 1,
          date: "2026-08-06",
        },
      ],
    },
    {
      name: "Subscriptions",
      icon: "mdi-receipt-text-outline",
      color: "#546E7A",
      entries: [
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2025-11-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2025-12-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-01-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-02-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-03-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-04-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-05-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-06-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-07-05",
        },
        {
          name: "Music subscription",
          value: 19.99,
          is_spending: 1,
          date: "2026-08-05",
        },
      ],
    },
    {
      name: "Education",
      icon: "mdi-school-outline",
      color: "#5E35B1",
      entries: [
        {
          name: "Online course",
          value: 120,
          is_spending: 1,
          date: "2025-11-07",
        },
        {
          name: "Book bundle",
          value: 45,
          is_spending: 1,
          date: "2025-12-02",
        },
        {
          name: "Workshop",
          value: 220,
          is_spending: 1,
          date: "2026-01-07",
        },
        {
          name: "Language app",
          value: 60,
          is_spending: 1,
          date: "2026-02-22",
        },
        {
          name: "E-book bundle",
          value: 80,
          is_spending: 1,
          date: "2026-03-07",
        },
        {
          name: "Webinar pass",
          value: 40,
          is_spending: 1,
          date: "2026-04-11",
        },
        {
          name: "Certification fee",
          value: 140,
          is_spending: 1,
          date: "2026-06-07",
        },
        {
          name: "Conference ticket",
          value: 60,
          is_spending: 1,
          date: "2026-08-07",
        },
      ],
    },
    {
      name: "Shopping",
      icon: "mdi-shopping-outline",
      color: "#F4511E",
      entries: [
        {
          name: "Winter coat",
          value: 160,
          is_spending: 1,
          date: "2025-11-30",
        },
        {
          name: "Holiday gifts",
          value: 90,
          is_spending: 1,
          date: "2025-12-12",
        },
        {
          name: "Tech accessory",
          value: 210,
          is_spending: 1,
          date: "2026-01-30",
        },
        {
          name: "Skincare set",
          value: 55,
          is_spending: 1,
          date: "2026-02-18",
        },
        {
          name: "Home decor",
          value: 130,
          is_spending: 1,
          date: "2026-03-30",
        },
        {
          name: "Kitchen tools",
          value: 48,
          is_spending: 1,
          date: "2026-04-16",
        },
        {
          name: "Office chair",
          value: 190,
          is_spending: 1,
          date: "2026-05-28",
        },
        {
          name: "Summer shoes",
          value: 180,
          is_spending: 1,
          date: "2026-06-30",
        },
        {
          name: "Backpack",
          value: 75,
          is_spending: 1,
          date: "2026-07-22",
        },
        {
          name: "Back-to-school",
          value: 95,
          is_spending: 1,
          date: "2026-08-30",
        },
      ],
    },
    {
      name: "Travel",
      icon: "mdi-airplane",
      color: "#00ACC1",
      entries: [
        {
          name: "Weekend trip",
          value: 220,
          is_spending: 1,
          date: "2025-12-18",
        },
        {
          name: "Hotel deposit",
          value: 120,
          is_spending: 1,
          date: "2026-02-10",
        },
        {
          name: "Spring getaway",
          value: 450,
          is_spending: 1,
          date: "2026-03-15",
        },
        {
          name: "City break",
          value: 380,
          is_spending: 1,
          date: "2026-05-02",
        },
        {
          name: "Summer vacation",
          value: 520,
          is_spending: 1,
          date: "2026-07-04",
        },
        {
          name: "Family visit",
          value: 260,
          is_spending: 1,
          date: "2026-08-16",
        },
        {
          name: "Day trip",
          value: 95,
          is_spending: 1,
          date: "2026-08-24",
        },
      ],
    },
    {
      name: "Insurance",
      icon: "mdi-shield-check-outline",
      color: "#3949AB",
      entries: [
        {
          name: "Renters insurance",
          value: 110,
          is_spending: 1,
          date: "2025-11-18",
        },
        {
          name: "Renters insurance",
          value: 115,
          is_spending: 1,
          date: "2026-01-18",
        },
        {
          name: "Renters insurance",
          value: 120,
          is_spending: 1,
          date: "2026-03-18",
        },
        {
          name: "Renters insurance",
          value: 125,
          is_spending: 1,
          date: "2026-05-18",
        },
        {
          name: "Renters insurance",
          value: 130,
          is_spending: 1,
          date: "2026-07-18",
        },
        {
          name: "Renters insurance",
          value: 125,
          is_spending: 1,
          date: "2026-08-18",
        },
      ],
    },
    {
      name: "Home maintenance",
      icon: "mdi-hammer-wrench",
      color: "#8D6E63",
      entries: [
        {
          name: "Light bulbs",
          value: 18,
          is_spending: 1,
          date: "2025-11-16",
        },
        {
          name: "Plumber visit",
          value: 85,
          is_spending: 1,
          date: "2025-12-14",
        },
        {
          name: "Cleaning supplies",
          value: 32,
          is_spending: 1,
          date: "2026-02-08",
        },
        {
          name: "Garden tools",
          value: 45,
          is_spending: 1,
          date: "2026-04-09",
        },
        {
          name: "AC service",
          value: 110,
          is_spending: 1,
          date: "2026-06-21",
        },
        {
          name: "Paint touch-up",
          value: 60,
          is_spending: 1,
          date: "2026-08-08",
        },
      ],
    },
    {
      name: "Gifts & charity",
      icon: "mdi-gift-outline",
      color: "#EC407A",
      entries: [
        {
          name: "Local donation",
          value: 25,
          is_spending: 1,
          date: "2025-11-26",
        },
        {
          name: "Holiday gifts",
          value: 120,
          is_spending: 1,
          date: "2025-12-24",
        },
        {
          name: "Birthday gift",
          value: 35,
          is_spending: 1,
          date: "2026-02-01",
        },
        {
          name: "Fundraiser",
          value: 40,
          is_spending: 1,
          date: "2026-03-30",
        },
        {
          name: "Charity run",
          value: 30,
          is_spending: 1,
          date: "2026-05-05",
        },
        {
          name: "Wedding gift",
          value: 80,
          is_spending: 1,
          date: "2026-07-08",
        },
      ],
    },
    {
      name: "Pets",
      icon: "mdi-paw-outline",
      color: "#6D4C41",
      entries: [
        {
          name: "Pet food",
          value: 35,
          is_spending: 1,
          date: "2025-11-11",
        },
        {
          name: "Vet visit",
          value: 75,
          is_spending: 1,
          date: "2025-12-09",
        },
        {
          name: "Pet food",
          value: 34,
          is_spending: 1,
          date: "2026-01-14",
        },
        {
          name: "Grooming",
          value: 45,
          is_spending: 1,
          date: "2026-03-12",
        },
        {
          name: "Pet toys",
          value: 22,
          is_spending: 1,
          date: "2026-05-19",
        },
        {
          name: "Pet food",
          value: 36,
          is_spending: 1,
          date: "2026-07-15",
        },
      ],
    },
  ]

  const insertCategory = db.prepare(`
    INSERT INTO Category (id, name, icon, color, budget_tracker_id)
    VALUES (?, ?, ?, ?, ?)
  `)

  const insertSpending = db.prepare(`
    INSERT INTO Spending (id, name, budget_tracker_id, value, is_spending, category_id, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  for (const category of demoCategories) {
    const categoryId = randomUUID()

    insertCategory.run(categoryId, category.name, category.icon, category.color, demoTrackerId)

    for (const entry of category.entries) {
      insertSpending.run(
        randomUUID(),
        entry.name,
        demoTrackerId,
        entry.value,
        entry.is_spending,
        categoryId,
        entry.date,
      )
    }
  }

  console.log("✅ Demo data seeded\n")
}

async function main() {
  if (process.env.SEED === "true") {
    const db = initDatabase()

    try {
      await seedUsers(db)
      await seedDemoData(db)
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
