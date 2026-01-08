import type {
  BudgetTrackerRole,
  Category,
} from "~/types"

import db from "@@/server/api/db"

import { randomUUID } from "node:crypto"

function canEditCategory(role: Exclude<BudgetTrackerRole, null>): boolean {
  return [ "owner", "admin", "editor" ].includes(role)
}

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
      const {
        category_id, budget_tracker_id,
      } = getQuery(event)

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

        const hasAccess = db.prepare(`
          SELECT 1 FROM UserBudgetTracker
          WHERE user_id = ? AND budget_tracker_id = ?
        `)
          .get(userId, category.budget_tracker_id)

        if (!hasAccess) {
          throw createError({
            status: 403, message: "Access denied",
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
        if (!budget_tracker_id) {
          throw createError({
            status: 400, message: "Missing budget_tracker_id",
          })
        }

        const hasAccess = db.prepare(`
          SELECT 1 FROM UserBudgetTracker
          WHERE user_id = ? AND budget_tracker_id = ?
        `)
          .get(userId, budget_tracker_id)

        if (!hasAccess) {
          throw createError({
            status: 403, message: "Access denied",
          })
        }

        // oxlint-disable-next-line no-unsafe-type-assertion
        const categories = db.prepare(`
          SELECT c.*
          FROM Category c
          WHERE c.budget_tracker_id = ?
        `)
          .all(budget_tracker_id) as Category[]

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
        name, icon, color, budget_tracker_id,
      } = await readBody(event)

      if (!name || !icon || !color || !budget_tracker_id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const userAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(userId, budget_tracker_id) as { role: Exclude<BudgetTrackerRole, null> } | undefined

      if (!userAccess) {
        throw createError({
          status: 403, message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to add categories",
        })
      }

      const categoryId = randomUUID()

      db.prepare(`
        INSERT INTO Category (id, name, icon, color, budget_tracker_id)
        VALUES (?, ?, ?, ?, ?)
      `)
        .run(categoryId, name, icon, color, budget_tracker_id)

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

      const category = db.prepare("SELECT budget_tracker_id FROM Category WHERE id = ?")
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(id) as { budget_tracker_id: string } | undefined

      if (!category) {
        throw createError({
          status: 404, message: "Category not found",
        })
      }

      const userAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(userId, category.budget_tracker_id) as { role: Exclude<BudgetTrackerRole, null> } | undefined

      if (!userAccess) {
        throw createError({
          status: 403, message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to edit categories",
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

      const category = db.prepare("SELECT budget_tracker_id FROM Category WHERE id = ?")
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(id) as { budget_tracker_id: string } | undefined

      if (!category) {
        throw createError({
          status: 404, message: "Category not found",
        })
      }

      const userAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(userId, category.budget_tracker_id) as { role: Exclude<BudgetTrackerRole, null> } | undefined

      if (!userAccess) {
        throw createError({
          status: 403, message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to delete categories",
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
