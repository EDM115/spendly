import db from "@@/server/api/db"

type BudgetTracker = {
  id: number;
  name: string;
}

type BudgetTrackerWithRole = BudgetTracker & {
  role: string;
}

type UserBudgetTrackerRole = {
  role: string;
}

function canEditTracker(role: string): boolean {
  return [ "owner", "admin" ].includes(role)
}

function canDeleteTracker(role: string): boolean {
  return role === "owner"
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
      const { budget_tracker_id } = getQuery(event)

      if (budget_tracker_id) {
        const budgetTracker = db.prepare(`
          SELECT bt.*, ubt.role FROM BudgetTracker bt
          INNER JOIN UserBudgetTracker ubt ON bt.id = ubt.budget_tracker_id
          WHERE bt.id = ? AND ubt.user_id = ?
        `)
          // oxlint-disable-next-line no-unsafe-type-assertion
          .get(budget_tracker_id, userId) as BudgetTrackerWithRole | undefined

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
        // oxlint-disable-next-line no-unsafe-type-assertion
        const budgetTrackers = db.prepare(`
          SELECT bt.*, ubt.role FROM BudgetTracker bt
          INNER JOIN UserBudgetTracker ubt ON bt.id = ubt.budget_tracker_id
          WHERE ubt.user_id = ?
        `)
          .all(userId) as BudgetTrackerWithRole[]

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
      const { name } = await readBody(event)

      if (!name) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const newBudgetTracker = db.prepare(`
        INSERT INTO BudgetTracker (name)
        VALUES (?)
      `)
        .run(name)

      const budgetTrackerId = newBudgetTracker.lastInsertRowid

      db.prepare(`
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
      } = await readBody(event)

      if (!id || !name) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const userAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(userId, id) as UserBudgetTrackerRole | undefined

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

      db.prepare(`
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
      const { id } = await readBody(event)

      if (!id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const userAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(userId, id) as UserBudgetTrackerRole | undefined

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

      db.prepare(`
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
