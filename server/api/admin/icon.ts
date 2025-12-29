import type { Icon } from "~/types"

import db from "@@/server/api/db"

import { randomUUID } from "node:crypto"

export default defineEventHandler(async (event) => {
  if (![ "GET", "POST", "PUT", "DELETE" ].includes(event.method)) {
    throw createError({
      status: 405, message: "Method not allowed",
    })
  }

  switch (event.method) {
    case "GET": {
      // oxlint-disable-next-line no-unsafe-type-assertion
      const icons = db.prepare(`
        SELECT * FROM Icon
      `)
        .all() as Icon[]

      return {
        status: 200,
        body: {
          success: "Icons retrieved",
          icons,
        },
      }
    }
    case "POST": {
      const {
        name, color, icon,
      } = await readBody(event)

      if (!name || !color || !icon) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const iconId = randomUUID()

      db.prepare(`
        INSERT INTO Icon (id, name, color, icon)
        VALUES (?, ?, ?, ?)
      `)
        .run(iconId, name, color, icon)

      return {
        status: 201,
        body: {
          success: "Icon created",
          id: iconId,
        },
      }
    }
    case "PUT": {
      const {
        id, name, color, icon,
      } = await readBody(event)

      if (!id || !name || !color || !icon) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      db.prepare(`
        UPDATE Icon
        SET name = ?, color = ?, icon = ?
        WHERE id = ?
      `)
        .run(name, color, icon, id)

      return {
        status: 200,
        body: {
          success: "Icon updated",
        },
      }
    }
    case "DELETE": {
      const { id } = await readBody(event)

      if (!id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      db.prepare(`
        DELETE FROM Icon
        WHERE id = ?
      `)
        .run(id)

      return {
        status: 200,
        body: {
          success: "Icon deleted",
        },
      }
    }
    default: {
      throw createError({
        status: 405, message: "Method not allowed",
      })
    }
  }
})
