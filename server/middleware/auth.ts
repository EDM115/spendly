import db from "#shared/db/drizzle"
import { User } from "#shared/db/schema"

import jwt from "jsonwebtoken"

import {
  and,
  eq,
} from "drizzle-orm"

export default defineEventHandler(async (event) => {
  if ((/^\/api(\/(?!login|auth\/validate).*)?$/).test(event.node.req.url ?? "")) {
    const authHeader = event.node.req.headers.authorization

    if (!authHeader) {
      return sendError(
        event,
        createError({
          status: 401,
          statusText: "Unauthorized",
        }),
      )
    }

    const [ , token ] = authHeader.split(" ")

    try {
      // oxlint-disable-next-line no-unsafe-type-assertion
      const payload = jwt.verify(token!, process.env.JWT_SECRET ?? "secret") as unknown as {
        id: string;
        username: string;
      }

      event.context.auth = {
        userId: payload.id,
        username: payload.username,
      }
    } catch {
      return sendError(
        event,
        createError({
          status: 401,
          statusText: "Unauthorized",
        }),
      )
    }

    if ((/^\/api\/admin(\/.*)?$/).test(event.node.req.url ?? "")) {
      const userId: string | undefined = event.context.auth?.userId

      if (!userId) {
        return sendError(
          event,
          createError({
            status: 401,
            statusText: "Unauthorized",
          }),
        )
      }

      const admin = await db.select()
        .from(User)
        .where(and(
          eq(User.id, userId),
          eq(User.role, "admin"),
        ))
        .limit(1)

      if (admin.length === 0) {
        return sendError(
          event,
          createError({
            status: 403,
            statusText: "Admin not found or insufficient permissions",
          }),
        )
      }
    }
  }
})
