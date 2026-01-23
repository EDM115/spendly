import db from "#server/api/db"

import jwt from "jsonwebtoken"

export default defineEventHandler(async (event) => {
  if ((/^\/api(\/(?!login|auth\/validate).*)?$/).test(event.node.req.url ?? "")) {
    const authHeader = event.node.req.headers.authorization

    if (!authHeader) {
      return sendError(event, createError({
        status: 401,
        statusText: "Unauthorized",
      }))
    }

    const [ , token ] = authHeader.split(" ")

    try {
      // oxlint-disable-next-line no-unsafe-type-assertion
      const payload = jwt.verify(token!, process.env.JWT_SECRET ?? "secret") as unknown as {
        id: string;
        username: string;
      }

      event.context.auth = { userId: payload.id }
    } catch {
      return sendError(event, createError({
        status: 401,
        statusText: "Unauthorized",
      }))
    }

    if ((/^\/api\/admin(\/.*)?$/).test(event.node.req.url ?? "")) {
      const userId: string | undefined = event.context.auth?.userId

      if (!userId) {
        return sendError(event, createError({
          status: 401,
          statusText: "Unauthorized",
        }))
      }

      const admin = db.prepare(`
          SELECT 1 FROM User
          WHERE id = ? AND role = 'admin'
        `)
        .get(userId)

      if (!admin) {
        return sendError(event, createError({
          status: 403,
          statusText: "Admin not found or insufficient permissions",
        }))
      }
    }
  }
})
