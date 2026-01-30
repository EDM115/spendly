import db from "#shared/db/drizzle"
import {
  User,
  UserBudgetTracker,
} from "#shared/db/schema"

import {
  and,
  eq,
} from "drizzle-orm"

const VALID_ROLES = new Set([ "viewer", "editor", "admin" ])

function canManageUsers(role: BudgetTrackerRole): boolean {
  return [ "owner", "admin" ].includes(role)
}

function canChangeRole(
  currentUserRole: BudgetTrackerRole,
  targetRole: BudgetTrackerRole,
  newRole: BudgetTrackerRole,
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
      status: 405,
      message: "Method not allowed",
    })
  }

  const userId: string | undefined = event.context.auth?.userId

  if (!userId) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    })
  }

  switch (event.method) {
    case "GET": {
      const { budget_tracker_id }: { budget_tracker_id?: string } = getQuery(event)

      if (!budget_tracker_id) {
        throw createError({
          status: 400,
          message: "Missing budget_tracker_id",
        })
      }

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      const users = await db.select({
        user_id: User.id,
        username: User.username,
        role: UserBudgetTracker.role,
      })
        .from(User)
        .innerJoin(UserBudgetTracker, eq(User.id, UserBudgetTracker.user_id))
        .where(eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id))

      return {
        status: 200,
        body: {
          success: "Users retrieved",
          users,
        },
      }
    }
    case "POST": {
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage budget tracker users",
        })
      }

      const {
        budget_tracker_id,
        username,
        role = "viewer",
      }: {
        budget_tracker_id?: string;
        username?: string;
        role?: BudgetTrackerRole;
      } = await readBody(event)

      if (!budget_tracker_id || !username) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      if (!VALID_ROLES.has(role)) {
        throw createError({
          status: 400,
          message: "Invalid role. Must be viewer, editor, or admin",
        })
      }

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canManageUsers(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to manage users",
        })
      }

      const targetUser = await db.select({ id: User.id })
        .from(User)
        .where(eq(User.username, username))
        .limit(1)

      if (targetUser.length === 0) {
        throw createError({
          status: 404,
          message: "User not found",
        })
      }

      const alreadyHasAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, targetUser[0]!.id),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (alreadyHasAccess.length > 0) {
        throw createError({
          status: 400,
          message: "User already has access",
        })
      }

      await db.insert(UserBudgetTracker)
        .values({
          user_id: targetUser[0]!.id,
          budget_tracker_id,
          role,
        })

      return {
        status: 201,
        body: {
          success: "User added to budget tracker",
        },
      }
    }
    case "PUT": {
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage budget tracker users",
        })
      }

      const {
        budget_tracker_id,
        target_user_id,
        role,
      }: {
        budget_tracker_id?: string;
        target_user_id?: string;
        role?: BudgetTrackerRole;
      } = await readBody(event)

      if (!budget_tracker_id || !target_user_id || !role) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      if (!VALID_ROLES.has(role)) {
        throw createError({
          status: 400,
          message: "Invalid role. Must be viewer, editor, or admin",
        })
      }

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      const targetUserAccess = await db.select({ role: UserBudgetTracker.role })
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, target_user_id),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (targetUserAccess.length === 0) {
        throw createError({
          status: 404,
          message: "Target user not found in this budget tracker",
        })
      }

      if (targetUserAccess[0]!.role === "owner") {
        throw createError({
          status: 403,
          message: "Cannot change the owner's role",
        })
      }

      if (!canChangeRole(userAccess[0]!.role , targetUserAccess[0]!.role , role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to change this user's role",
        })
      }

      await db.update(UserBudgetTracker)
        .set({ role })
        .where(and(
          eq(UserBudgetTracker.user_id, target_user_id),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))

      return {
        status: 200,
        body: {
          success: "User role updated",
        },
      }
    }
    case "DELETE": {
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage budget tracker users",
        })
      }

      const {
        budget_tracker_id,
        target_user_id,
      }: {
        budget_tracker_id?: string;
        target_user_id?: string;
      } = await readBody(event)

      if (!budget_tracker_id || !target_user_id) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (target_user_id === userId) {
        throw createError({
          status: 400,
          message: "Cannot remove yourself from budget tracker",
        })
      }

      const targetUserAccess = await db.select({ role: UserBudgetTracker.role })
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, target_user_id),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (targetUserAccess.length === 0) {
        throw createError({
          status: 404,
          message: "Target user not found in this budget tracker",
        })
      }

      if (targetUserAccess[0]!.role === "owner") {
        throw createError({
          status: 403,
          message: "Cannot remove the owner from budget tracker",
        })
      }

      if (!canManageUsers(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to remove users",
        })
      }

      await db.delete(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, target_user_id),
          eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
        ))

      return {
        status: 200,
        body: {
          success: "User removed from budget tracker",
        },
      }
    }
    default: {
      throw createError({
        status: 405,
        message: "Method not allowed",
      })
    }
  }
})
