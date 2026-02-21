import { db } from "#shared/db/drizzle"
import {
  user,
  user_requests,
} from "#shared/db/schema"
import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"

import {
  and,
  eq,
} from "drizzle-orm"
import { randomUUID } from "node:crypto"

type UserRequestType = "export" | "delete"

const supportedTypes = new Set<UserRequestType>([ "export", "delete" ])

export default defineEventHandler(async (event) => {
  if (![ "GET", "POST" ].includes(event.method)) {
    throw createError({
      status: 405,
      message: "Method not allowed",
    })
  }

  const userId = requireUserId(event.context.auth)

  if (event.method === "GET") {
    const requests = await db.select({
      id: user_requests.id,
      type: user_requests.type,
      request_date: user_requests.request_date,
    })
      .from(user_requests)
      .where(eq(user_requests.user_id, userId))

    addWide(event, {
      op: {
        name: "userRequest.list",
        entity: "userRequest",
        count: requests.length,
      },
    })

    return {
      status: 200,
      body: {
        success: "User requests retrieved",
        requests,
      },
    }
  }

  const { type }: { type?: UserRequestType } = await readBody(event)

  if (!type || !supportedTypes.has(type)) {
    throw createError({
      status: 400,
      message: "Invalid request type",
    })
  }

  const existing = await db.select({
    id: user_requests.id,
  })
    .from(user_requests)
    .where(and(
      eq(user_requests.user_id, userId),
      eq(user_requests.type, type),
    ))
    .limit(1)

  if (existing.length > 0) {
    addWide(event, {
      op: {
        name: "userRequest.create",
        entity: "userRequest",
      },
      meta: {
        request_type: type,
        duplicate: true,
      },
    })

    return {
      status: 200,
      body: {
        success: "User request already exists",
        duplicate: true,
        id: existing[0]!.id,
      },
    }
  }

  const requestId = randomUUID()

  await db.insert(user_requests)
    .values({
      id: requestId,
      user_id: userId,
      type,
      request_date: new Date(),
    })

  addWide(event, {
    op: {
      name: "userRequest.create",
      entity: "userRequest",
      entity_id: requestId,
    },
    meta: {
      request_type: type,
      duplicate: false,
    },
  })

  if (type === "delete") {
    // Since the user requests this, we can't use auth admin methods there
    // However we can forcefully insert the data in db

    await db.update(user)
      .set({
        banned: true,
        banReason: "User requested account deletion",
      })
      .where(eq(user.id, userId))
  }

  return {
    status: 201,
    body: {
      success: "User request created",
      id: requestId,
    },
  }
})
