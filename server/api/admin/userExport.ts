import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"
import { buildUserExport } from "#server/utils/userExport"

export default defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    throw createError({
      status: 405,
      message: "Method not allowed",
    })
  }

  const authContext = event.context.auth

  requireUserId(authContext)

  if (authContext?.role !== "admin") {
    throw createError({
      status: 403,
      message: "Admin access required",
    })
  }

  const { userId } = getQuery(event)
  const targetUserId = typeof userId === "string"
    ? userId
    : undefined

  if (!targetUserId) {
    throw createError({
      status: 400,
      message: "Missing userId",
    })
  }

  const {
    body,
    filename,
  } = await buildUserExport(event, targetUserId)

  addWide(event, {
    op: {
      name: "admin.userExport",
      entity: "user",
      entity_id: targetUserId,
    },
  })

  return {
    body,
    filename,
  }
})
