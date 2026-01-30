import type { SeedUser } from "../shared/types/main"

import db from "../shared/db/drizzle"
import { User } from "../shared/db/schema"

import { hash } from "bcryptjs"
import { randomUUID } from "node:crypto"

const SALT_ROUNDS = 10

async function seedUsers() {
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

  await Promise.all(users.map(async ({
    username, password, role,
  }) => {
    const id = randomUUID()
    const hashed = await hash(password, SALT_ROUNDS)
    const newUser: typeof User.$inferInsert = {
      id,
      username,
      password: hashed,
      role,
    }

    await db.insert(User)
      .values(newUser)
    console.log(`Seeded user : ${username}`)
  }))

  console.log("\n✅ User seeding completed\n")
}

async function main() {
  if (process.env.SEED === "true") {
    try {
      await seedUsers()
    } catch (e) {
      console.error("❌ Error seeding database :", e)
    }

    console.log("✅ Database and seeded")
  } else {
    console.log("❌ Skipping database initialization")
  }
}

await main()
