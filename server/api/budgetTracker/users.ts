import type {
  BudgetTrackerRole,
  SharedUser,
} from "~/types"

import db from "@@/server/api/db"

const VALID_ROLES = new Set([ "viewer", "editor", "admin" ])

function canManageUsers(role: Exclude<BudgetTrackerRole, null>): boolean {
  return [ "owner", "admin" ].includes(role)
}

function canChangeRole(
  currentUserRole: Exclude<BudgetTrackerRole, null>,
  targetRole: Exclude<BudgetTrackerRole, null>,
  newRole: Exclude<BudgetTrackerRole, null>,
): boolean {
  if (currentUserRole === "owner") {
    return true
  }

  if (currentUserRole === "admin") {
    return targetRole !== "owner" && newRole !== "owner"
  }

  return false
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

      // oxlint-disable-next-line no-unsafe-type-assertion
      const users = db.prepare(`
        SELECT u.id as user_id, u.username, ubt.role FROM User u
        INNER JOIN UserBudgetTracker ubt ON u.id = ubt.user_id
        WHERE ubt.budget_tracker_id = ?
      `)
        .all(budget_tracker_id) as SharedUser[]

      return {
        status: 200,
        body: {
          success: "Users retrieved",
          users,
        },
      }
    }
    case "POST": {
      const {
        budget_tracker_id, username, role = "viewer",
      } = await readBody(event)

      if (!budget_tracker_id || !username) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      if (!VALID_ROLES.has(role)) {
        throw createError({
          status: 400, message: "Invalid role. Must be viewer, editor, or admin",
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

      if (!canManageUsers(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to manage users",
        })
      }

      const targetUser = db.prepare(`
        SELECT id FROM User WHERE username = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(username) as { id: string } | undefined

      if (!targetUser) {
        throw createError({
          status: 404, message: "User not found",
        })
      }

      const alreadyHasAccess = db.prepare(`
        SELECT 1 FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .get(targetUser.id, budget_tracker_id)

      if (alreadyHasAccess) {
        throw createError({
          status: 400, message: "User already has access",
        })
      }

      db.prepare(`
        INSERT INTO UserBudgetTracker (user_id, budget_tracker_id, role)
        VALUES (?, ?, ?)
      `)
        .run(targetUser.id, budget_tracker_id, role)

      return {
        status: 201,
        body: {
          success: "User added to budget tracker",
        },
      }
    }
    case "PUT": {
      const {
        budget_tracker_id, target_user_id, role,
      } = await readBody(event)

      if (!budget_tracker_id || !target_user_id || !role) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      if (!VALID_ROLES.has(role)) {
        throw createError({
          status: 400, message: "Invalid role. Must be viewer, editor, or admin",
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

      const targetUserAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(target_user_id, budget_tracker_id) as { role: Exclude<BudgetTrackerRole, null> } | undefined

      if (!targetUserAccess) {
        throw createError({
          status: 404, message: "Target user not found in this budget tracker",
        })
      }

      if (targetUserAccess.role === "owner") {
        throw createError({
          status: 403, message: "Cannot change the owner's role",
        })
      }

      if (!canChangeRole(userAccess.role, targetUserAccess.role, role)) {
        throw createError({
          status: 403, message: "You do not have permission to change this user's role",
        })
      }

      db.prepare(`
        UPDATE UserBudgetTracker
        SET role = ?
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .run(role, target_user_id, budget_tracker_id)

      return {
        status: 200,
        body: {
          success: "User role updated",
        },
      }
    }
    case "DELETE": {
      const {
        budget_tracker_id, target_user_id,
      } = await readBody(event)

      if (!budget_tracker_id || !target_user_id) {
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

      if (target_user_id === userId) {
        throw createError({
          status: 400, message: "Cannot remove yourself from budget tracker",
        })
      }

      const targetUserAccess = db.prepare(`
        SELECT role FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        // oxlint-disable-next-line no-unsafe-type-assertion
        .get(target_user_id, budget_tracker_id) as { role: Exclude<BudgetTrackerRole, null> } | undefined

      if (!targetUserAccess) {
        throw createError({
          status: 404, message: "Target user not found in this budget tracker",
        })
      }

      if (targetUserAccess.role === "owner") {
        throw createError({
          status: 403, message: "Cannot remove the owner from budget tracker",
        })
      }

      if (!canManageUsers(userAccess.role)) {
        throw createError({
          status: 403, message: "You do not have permission to remove users",
        })
      }

      db.prepare(`
        DELETE FROM UserBudgetTracker
        WHERE user_id = ? AND budget_tracker_id = ?
      `)
        .run(target_user_id, budget_tracker_id)

      return {
        status: 200,
        body: {
          success: "User removed from budget tracker",
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
