import type {
  BudgetTrackerRole,
  Spending,
} from "~/types"

import db from "@@/server/api/db"

import { randomUUID } from "node:crypto"

function canEditSpending(role: Exclude<BudgetTrackerRole, null>): boolean {
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
        budget_tracker_id, spending_id, start_date, end_date,
      } = getQuery(event)

      if (!budget_tracker_id) {
        throw createError({
          status: 400, message: "Missing budget_tracker_id",
        })
      }

      const hasAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .get(userId, budget_tracker_id)

      if (!hasAccess) {
        throw createError({
          status: 403, message: "Access denied",
        })
      }

      if (spending_id) {
        const spending = db.prepare(`
          SELECT s.*, c.name as category_name, i.name as icon_name, i.color as icon_color, i.icon
          FROM Spending s
          INNER JOIN Category c ON s.category_id = c.id
          INNER JOIN Icon i ON c.icon_id = i.id
          WHERE s.id = ? AND s.budget_tracker_id = ?
        `)
          // oxlint-disable-next-line no-unsafe-type-assertion
          .get(spending_id, budget_tracker_id) as Spending | undefined

        if (!spending) {
          throw createError({
            status: 404,
            message: "Spending not found",
          })
        }

        return {
          status: 200,
          body: {
            success: "Spending retrieved",
            spending,
          },
        }
      } else {
        let query = `
          SELECT s.*, c.name as category_name, i.name as icon_name, i.color as icon_color, i.icon
          FROM Spending s
          INNER JOIN Category c ON s.category_id = c.id
          INNER JOIN Icon i ON c.icon_id = i.id
          WHERE s.budget_tracker_id = ?
        `
        // oxlint-disable-next-line no-unsafe-type-assertion
        const params: string[] = [budget_tracker_id as string]

        if (start_date && typeof start_date === "string") {
          query += " AND s.date >= ?"
          params.push(start_date)
        }

        if (end_date && typeof end_date === "string") {
          query += " AND s.date <= ?"
          params.push(end_date)
        }

        query += " ORDER BY s.date DESC"

        // oxlint-disable-next-line no-unsafe-type-assertion
        const spendings = db.prepare(query)
          .all(...params) as Spending[]

        return {
          status: 200,
          body: {
            success: "Spendings retrieved",
            spendings,
          },
        }
      }
    }
    case "POST": {
      const {
        name, budget_tracker_id, value, is_spending, category_id, date,
      } = await readBody(event)

      if (!name || !budget_tracker_id || value === undefined || is_spending === undefined || !category_id || !date) {
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

      if (!canEditSpending(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to add transactions",
        })
      }

      const categoryExists = db.prepare(`
        SELECT 1 FROM Category WHERE id = ?
      `)
        .get(category_id)

      if (!categoryExists) {
        throw createError({
          status: 404, message: "Category not found",
        })
      }

      const spendingId = randomUUID()

      db.prepare(`
        INSERT INTO Spending (id, name, budget_tracker_id, value, is_spending, category_id, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
        .run(spendingId, name, budget_tracker_id, value, is_spending
          ? 1
          : 0, category_id, date)

      return {
        status: 201,
        body: {
          success: "Spending created",
          id: spendingId,
        },
      }
    }
    case "PUT": {
      const {
        id, name, value, is_spending, category_id, date, budget_tracker_id,
      } = await readBody(event)

      if (!id || !name || value === undefined || is_spending === undefined || !category_id || !date || !budget_tracker_id) {
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

      if (!canEditSpending(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to edit transactions",
        })
      }

      const categoryExists = db.prepare(`
        SELECT 1 FROM Category WHERE id = ?
      `)
        .get(category_id)

      if (!categoryExists) {
        throw createError({
          status: 404, message: "Category not found",
        })
      }

      db.prepare(`
        UPDATE Spending
        SET name = ?, value = ?, is_spending = ?, category_id = ?, date = ?
        WHERE id = ? AND budget_tracker_id = ?
      `)
        .run(name, value, is_spending
          ? 1
          : 0, category_id, date, id, budget_tracker_id)

      return {
        status: 200,
        body: {
          success: "Spending updated",
        },
      }
    }
    case "DELETE": {
      const {
        id, budget_tracker_id,
      } = await readBody(event)

      if (!id || !budget_tracker_id) {
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

      if (!canEditSpending(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to delete transactions",
        })
      }

      db.prepare(`
        DELETE FROM Spending
        WHERE id = ? AND budget_tracker_id = ?
      `)
        .run(id, budget_tracker_id)

      return {
        status: 200,
        body: {
          success: "Spending deleted",
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
