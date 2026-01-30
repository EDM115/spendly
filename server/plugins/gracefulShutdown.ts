import db from "#shared/db/drizzle"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("close", () => {
    db.$client.close()
    console.log("Database connection closed")
  })
})
