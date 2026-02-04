import type { UserType } from "../shared/types/main"

import { auth } from "../server/utils/auth"
import { db } from "../shared/db/drizzle"
import { schema } from "../shared/db/schema"
import { eq } from "drizzle-orm"

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
    return JSON.parse(raw)
  } catch (e) {
    console.error("❌ failed to parse SEED_USERS:", e)

    return []
  }
}

async function seedUsers() {
  const users = parseSeedUsers()

  for (const u of users) {
    // oxlint-disable-next-line no-await-in-loop
    const existing = await db.query.user.findFirst({
      where: eq(schema.user.email, u.email),
      columns: {
        id: true, email: true,
      },
    })

    if (existing) {
      console.log(`↩️  User already exists : ${u.email}, skipping`)

      continue
    }

    // oxlint-disable-next-line no-await-in-loop
    await auth.api.createUser({
      body: {
        email: u.email,
        password: u.password,
        name: u.username,
        role: u.role,
        data: {
          username: u.username,
          displayUsername: u.username,
          emailVerified: true,
        },
      },
    })

    console.log(`✅ Seeded user : ${u.username} (${u.email})`)
  }
}

async function main() {
  if (process.env.SEED !== "true") {
    console.log("❌ Skipping database initialization")

    return
  }

  await seedUsers()
  console.log("✅ User seeding completed")
}

await main()
