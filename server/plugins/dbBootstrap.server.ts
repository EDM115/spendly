import type { UserType } from "#shared/types/main"

import { auth } from "#server/utils/auth"
import { db } from "#shared/db/drizzle"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

type SeedUser = {
  email: string;
  username: string;
  password: string;
  role: UserType;
}

function parseSeedUsers(): SeedUser[] {
  const raw = (process.env.SEED_USERS ?? "[]")
    .replace("\\'", "'")
    .replace("\\\"", "\"")

  try {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return JSON.parse(raw) as SeedUser[]
  } catch (error) {
    console.error("❌ failed to parse SEED_USERS :", error)

    return []
  }
}

async function hasExistingUsers(): Promise<boolean> {
  const existing = await db.query.user.findFirst({
    columns: {
      id: true,
    },
  })

  return Boolean(existing)
}

async function seedUsers(): Promise<void> {
  const users = parseSeedUsers()

  if (users.length === 0) {
    console.log("ℹ️  No seed users provided, skipping")

    return
  }

  for (const user of users) {
    // oxlint-disable-next-line no-await-in-loop
    await auth.api.createUser({
      body: {
        email: user.email,
        password: user.password,
        name: user.username,
        role: user.role,
        data: {
          username: user.username,
          displayUsername: user.username,
          emailVerified: true,
        },
      },
    })

    console.log(`✅ Seeded user : ${user.username} (${user.email})`)
  }
}

export default defineNitroPlugin(async () => {
  try {
    migrate(db, { migrationsFolder: "drizzle" })
    console.log("✅ Database migrations applied")
  } catch (error) {
    console.error("❌ Database migrations failed :", error)

    throw error
  }

  if (process.env.SEED !== "true") {
    console.log("ℹ️  SEED is disabled, skipping database seeding")

    return
  }

  const hasUsers = await hasExistingUsers()

  if (hasUsers) {
    console.log("↩️  Existing data detected, skipping database seeding")

    return
  }

  await seedUsers()
  console.log("✅ Database seeding completed")
})
