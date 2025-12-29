import type { Category } from "~/types"

import db from "@@/server/api/db"

import { randomUUID } from "node:crypto"

export default defineEventHandler(async (event) => {
  if (![ "GET", "POST", "PUT", "DELETE" ].includes(event.method)) {
    throw createError({
      status: 405, message: "Method not allowed",
    })
  }

  const userId = event.context.auth?.userId

  if (!userId) {
    throw createError({
      status: 401, message: "Unauthorized",
    })
  }

  switch (event.method) {
    case "GET": {
      const { category_id } = getQuery(event)

      if (category_id) {
        const category = db.prepare(`
          SELECT c.*, i.name as icon_name, i.color as icon_color, i.icon
          FROM Category c
          INNER JOIN Icon i ON c.icon_id = i.id
          WHERE c.id = ?
        `)
          // oxlint-disable-next-line no-unsafe-type-assertion
          .get(category_id) as Category | undefined

        if (!category) {
          throw createError({
            status: 404,
            message: "Category not found",
          })
        }

        return {
          status: 200,
          body: {
            success: "Category retrieved",
            category,
          },
        }
      } else {
        // oxlint-disable-next-line no-unsafe-type-assertion
        const categories = db.prepare(`
          SELECT c.*, i.name as icon_name, i.color as icon_color, i.icon
          FROM Category c
          INNER JOIN Icon i ON c.icon_id = i.id
        `)
          .all() as Category[]

        return {
          status: 200,
          body: {
            success: "Categories retrieved",
            categories,
          },
        }
      }
    }
    case "POST": {
      const {
        name, icon_id,
      } = await readBody(event)

      if (!name || !icon_id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const iconExists = db.prepare(`
        SELECT 1 FROM Icon WHERE id = ?
      `)
        .get(icon_id)

      if (!iconExists) {
        throw createError({
          status: 404, message: "Icon not found",
        })
      }

      const categoryId = randomUUID()

      db.prepare(`
        INSERT INTO Category (id, name, icon_id)
        VALUES (?, ?, ?)
      `)
        .run(categoryId, name, icon_id)

      return {
        status: 201,
        body: {
          success: "Category created",
          id: categoryId,
        },
      }
    }
    case "PUT": {
      const {
        id, name, icon_id,
      } = await readBody(event)

      if (!id || !name || !icon_id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const iconExists = db.prepare(`
        SELECT 1 FROM Icon WHERE id = ?
      `)
        .get(icon_id)

      if (!iconExists) {
        throw createError({
          status: 404, message: "Icon not found",
        })
      }

      db.prepare(`
        UPDATE Category
        SET name = ?, icon_id = ?
        WHERE id = ?
      `)
        .run(name, icon_id, id)

      return {
        status: 200,
        body: {
          success: "Category updated",
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
        DELETE FROM Category
        WHERE id = ?
      `)
        .run(id)

      return {
        status: 200,
        body: {
          success: "Category deleted",
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
