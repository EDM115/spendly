import { db } from "#shared/db/drizzle"
import { logger } from "#server/utils/logger"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("close", () => {
    if (db.$client.open) {
      db.$client.close()
    }

    logger.info({
      kind: "system",
      op: {
        name: "db.connection.close",
        entity: "database",
      },
      outcome: "success",
    })
  })
})
