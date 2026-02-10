import type { UserType } from "../shared/types/main"

import { auth } from "../server/utils/auth"
import { db } from "../shared/db/drizzle"
import { schema } from "../shared/db/schema"
import { logger } from "../server/utils/logger"
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
    logger.error({
      kind: "system",
      op: {
        name: "seed.parse",
        entity: "user",
      },
      outcome: "error",
      error: {
        type: "seed_parse_error",
        message: e instanceof Error
          ? e.message
          : "Failed to parse SEED_USERS",
      },
    })

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
      logger.info({
        kind: "system",
        op: {
          name: "seed.skip",
          entity: "user",
        },
        outcome: "success",
        meta: {
          reason: "user_exists",
          username: u.username,
        },
      })

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

    logger.info({
      kind: "system",
      op: {
        name: "seed.user",
        entity: "user",
      },
      outcome: "success",
      meta: {
        username: u.username,
      },
    })
  }
}

async function main() {
  if (process.env.SEED !== "true") {
    logger.info({
      kind: "system",
      op: {
        name: "seed.skip",
        entity: "database",
      },
      outcome: "success",
      meta: {
        reason: "seed_disabled",
      },
    })

    return
  }

  await seedUsers()
  logger.info({
    kind: "system",
    op: {
      name: "seed.complete",
      entity: "database",
    },
    outcome: "success",
  })
}

await main()
