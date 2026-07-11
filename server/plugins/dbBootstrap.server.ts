import type { UserType } from "#shared/types/main"

import { db } from "#shared/db/drizzle"
import { auth } from "#server/utils/auth"
import { logger } from "#server/utils/logger"

import { migrate } from "drizzle-orm/better-sqlite3/migrator"

type SeedUser = {
  email: string;
  username: string;
  password: string;
  role: UserType;
}

let bootstrapPromise: Promise<void> | undefined

function parseSeedUsers(): SeedUser[] {
  const raw = (process.env.SEED_USERS ?? "[]")
    .replace("\\'", "'")
    .replace("\\\"", "\"")

  try {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return JSON.parse(raw) as SeedUser[]
  } catch (error) {
    logger.error({
      kind: "system",
      op: {
        name: "seed.parse",
        entity: "user",
      },
      outcome: "error",
      error: {
        type: "seed_parse_error",
        message: error instanceof Error
          ? error.message
          : "Failed to parse SEED_USERS",
      },
    })

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
    logger.info({
      kind: "system",
      op: {
        name: "seed.skip",
        entity: "user",
      },
      outcome: "success",
      meta: {
        reason: "no_seed_users",
      },
    })

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

    logger.info({
      kind: "system",
      op: {
        name: "seed.user",
        entity: "user",
      },
      outcome: "success",
      meta: {
        username: user.username,
      },
    })
  }
}

async function bootstrapDatabase(): Promise<void> {
  try {
    migrate(db, { migrationsFolder: "drizzle" })
    logger.info({
      kind: "system",
      op: {
        name: "db.migrate",
        entity: "database",
      },
      outcome: "success",
    })
  } catch (error) {
    logger.error({
      kind: "system",
      op: {
        name: "db.migrate",
        entity: "database",
      },
      outcome: "error",
      error: {
        type: "migration_error",
        message: error instanceof Error
          ? error.message
          : "Database migrations failed",
      },
    })

    throw error
  }

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

  const hasUsers = await hasExistingUsers()

  if (hasUsers) {
    logger.info({
      kind: "system",
      op: {
        name: "seed.skip",
        entity: "database",
      },
      outcome: "success",
      meta: {
        reason: "existing_data",
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

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.prerender) {
    return
  }

  nitroApp.hooks.hook("request", async () => {
    bootstrapPromise ??= bootstrapDatabase()
    await bootstrapPromise
  })
})
