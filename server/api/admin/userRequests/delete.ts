import { db } from "#shared/db/drizzle"
import { user_requests } from "#shared/db/schema"
import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"

import { eq } from "drizzle-orm"

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
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

  const { requestId }: { requestId?: string } = await readBody(event)

  if (!requestId) {
    throw createError({
      status: 400,
      message: "Missing requestId",
    })
  }

  await db.delete(user_requests)
    .where(eq(user_requests.id, requestId))

  addWide(event, {
    op: {
      name: "admin.userRequest.delete",
      entity: "userRequest",
      entity_id: requestId,
    },
  })

  return {
    status: 200,
    body: {
      success: "User request deleted",
      id: requestId,
    },
  }
})
