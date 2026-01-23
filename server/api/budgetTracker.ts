import db from "#server/api/db"

import { randomUUID } from "node:crypto"

function canEditTracker(role: Exclude<BudgetTrackerRole, null>): boolean {
  return [ "owner", "admin" ].includes(role)
}

function canDeleteTracker(role: Exclude<BudgetTrackerRole, null>): boolean {
  return role === "owner"
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
      const { budget_tracker_id }: { budget_tracker_id?: string } = getQuery(event)

      if (budget_tracker_id) {
        const budgetTracker = db.prepare<[string, string], BudgetTracker>(`
          SELECT bt.*, ubt.role FROM BudgetTracker bt
          INNER JOIN UserBudgetTracker ubt ON bt.id = ubt.budget_tracker_id
          WHERE bt.id = ? AND ubt.user_id = ?
        `)
          .get(budget_tracker_id, userId)

        if (!budgetTracker) {
          throw createError({
            status: 404,
            message: "Budget tracker not found or access denied",
          })
        }

        return {
          status: 200,
          body: {
            success: "Budget tracker retrieved",
            budgetTracker,
          },
        }
      } else {
        const budgetTrackers = db.prepare<[string], BudgetTracker>(`
          SELECT bt.*, ubt.role FROM BudgetTracker bt
          INNER JOIN UserBudgetTracker ubt ON bt.id = ubt.budget_tracker_id
          WHERE ubt.user_id = ?
        `)
          .all(userId)

        return {
          status: 200,
          body: {
            success: "Budget trackers retrieved",
            budgetTrackers,
          },
        }
      }
    }
    case "POST": {
      const { name }: { name?: string } = await readBody(event)

      if (!name) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const budgetTrackerId = randomUUID()

      db.prepare<[string, string]>(`
        INSERT INTO BudgetTracker (id, name)
        VALUES (?, ?)
      `)
        .run(budgetTrackerId, name)

      db.prepare<[string, string]>(`
        INSERT INTO UserBudgetTracker (user_id, budget_tracker_id, role)
        VALUES (?, ?, 'owner')
      `)
        .run(userId, budgetTrackerId)

      return {
        status: 201,
        body: {
          success: "Budget tracker created",
          id: budgetTrackerId,
        },
      }
    }
    case "PUT": {
      const {
        id, name,
      }: {
        id?: string; name?: string;
      } = await readBody(event)

      if (!id || !name) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const userAccess = db.prepare<[string, string], { role: Exclude<BudgetTrackerRole, null> }>(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .get(userId, id)

      if (!userAccess) {
        throw createError({
          status: 403, message: "Access denied",
        })
      }

      if (!canEditTracker(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to edit this budget tracker",
        })
      }

      db.prepare<[string, string]>(`
        UPDATE BudgetTracker
        SET name = ?
        WHERE id = ?
      `)
        .run(name, id)

      return {
        status: 200,
        body: {
          success: "Budget tracker updated",
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

      const userAccess = db.prepare<[string, string], { role: Exclude<BudgetTrackerRole, null> }>(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .get(userId, id)

      if (!userAccess) {
        throw createError({
          status: 403, message: "Access denied",
        })
      }

      if (!canDeleteTracker(userAccess.role)) {
        throw createError({
          status: 403, message: "Only the owner can delete this budget tracker",
        })
      }

      db.prepare<[string]>(`
        DELETE FROM BudgetTracker
        WHERE id = ?
      `)
        .run(id)

      return {
        status: 200,
        body: {
          success: "Budget tracker deleted",
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
