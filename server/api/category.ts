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

  const userId: string | undefined = event.context.auth?.userId

  if (!userId) {
    throw createError({
      status: 401, message: "Unauthorized",
    })
  }

  switch (event.method) {
    case "GET": {
      const {
        category_id, budget_tracker_id,
      }: { category_id?: string; budget_tracker_id?: string } = getQuery(event)

      if (category_id) {
        const category = db.prepare<[string], Category>(`
          SELECT c.*
          FROM Category c
          WHERE c.id = ?
        `)
          .get(category_id)

        if (!category) {
          throw createError({
            status: 404,
            message: "Category not found",
          })
        }

        const hasAccess = db.prepare<[string, string], {
          user_id: string;
          budget_tracker_id: string;
          role: Exclude<BudgetTrackerRole, null>;
        }>(`
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

        const hasAccess = db.prepare<[string, string], {
          user_id: string;
          budget_tracker_id: string;
          role: Exclude<BudgetTrackerRole, null>;
        }>(`
          SELECT 1 FROM UserBudgetTracker
          WHERE user_id = ? AND budget_tracker_id = ?
        `)
          .get(userId, budget_tracker_id)

        if (!hasAccess) {
          throw createError({
            status: 403, message: "Access denied",
          })
        }

        const categories = db.prepare<[string], Category>(`
          SELECT c.*
          FROM Category c
          WHERE c.budget_tracker_id = ?
        `)
          .all(budget_tracker_id)

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
      }: {
        name?: string;
        icon?: string;
        color?: string;
        budget_tracker_id?: string;
      } = await readBody(event)

      if (!name || !icon || !color || !budget_tracker_id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const userAccess = db.prepare<[string, string], { role: Exclude<BudgetTrackerRole, null> }>(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .get(userId, budget_tracker_id)

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

      db.prepare<[string, string, string, string, string]>(`
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
      }: {
        id?: string;
        name?: string;
        icon?: string;
        color?: string;
      } = await readBody(event)

      if (!id || !name || !icon || !color) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const category = db.prepare<[string], { budget_tracker_id: string }>("SELECT budget_tracker_id FROM Category WHERE id = ?")
        .get(id)

      if (!category) {
        throw createError({
          status: 404, message: "Category not found",
        })
      }

      const userAccess = db.prepare<[string, string], { role: Exclude<BudgetTrackerRole, null> }>(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .get(userId, category.budget_tracker_id)

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

      db.prepare<[string, string, string, string]>(`
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
      const { id }: { id?: string } = await readBody(event)

      if (!id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const category = db.prepare<[string], { budget_tracker_id: string }>("SELECT budget_tracker_id FROM Category WHERE id = ?")
        .get(id)

      if (!category) {
        throw createError({
          status: 404, message: "Category not found",
        })
      }

      const userAccess = db.prepare<[string, string], { role: Exclude<BudgetTrackerRole, null> }>(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .get(userId, category.budget_tracker_id)

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

      db.prepare<[string]>(`
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
