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
          SELECT c.*
          FROM Category c
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
          SELECT c.*
          FROM Category c
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
        name, icon, color,
      } = await readBody(event)

      if (!name || !icon || !color) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const categoryId = randomUUID()

      db.prepare(`
        INSERT INTO Category (id, name, icon, color)
        VALUES (?, ?, ?, ?)
      `)
        .run(categoryId, name, icon, color)

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
        id, name, icon, color,
      } = await readBody(event)

      if (!id || !name || !icon || !color) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      db.prepare(`
        UPDATE Category
        SET name = ?, icon = ?, color = ?
        WHERE id = ?
      `)
        .run(name, icon, color, id)

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
