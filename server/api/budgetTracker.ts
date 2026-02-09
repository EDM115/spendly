import { db } from "#shared/db/drizzle"
import {
  budget_tracker,
  user_budget_tracker,
} from "#shared/db/schema"

import {
  and,
  eq,
} from "drizzle-orm"
import { randomUUID } from "node:crypto"
import { requireUserId } from "#server/utils/session"

function canEditTracker(role: BudgetTrackerRole): boolean {
  return [ "owner", "admin" ].includes(role)
}

function canDeleteTracker(role: BudgetTrackerRole): boolean {
  return role === "owner"
}

export default defineEventHandler(async (event) => {
  if (![ "GET", "POST", "PUT", "DELETE" ].includes(event.method)) {
    throw createError({
      status: 405,
      message: "Method not allowed",
    })
  }

  const userId = requireUserId(event.context.auth)

  switch (event.method) {
    case "GET": {
      const { budget_tracker_id }: { budget_tracker_id?: string } = getQuery(event)

      if (budget_tracker_id) {
        const budgetTracker = await db.select({
          id: budget_tracker.id,
          name: budget_tracker.name,
          role: user_budget_tracker.role,
        })
          .from(budget_tracker)
          .innerJoin(user_budget_tracker, eq(budget_tracker.id, user_budget_tracker.budget_tracker_id))
          .where(and(
            eq(budget_tracker.id, budget_tracker_id),
            eq(user_budget_tracker.user_id, userId),
          ))
          .limit(1)

        if (budgetTracker.length === 0) {
          throw createError({
            status: 404,
            message: "Budget tracker not found or access denied",
          })
        }

        return {
          status: 200,
          body: {
            success: "Budget tracker retrieved",
            budgetTracker: budgetTracker[0]!,
          },
        }
      } else {
        const budgetTrackers = await db.select({
          id: budget_tracker.id,
          name: budget_tracker.name,
          role: user_budget_tracker.role,
        })
          .from(budget_tracker)
          .innerJoin(user_budget_tracker, eq(budget_tracker.id, user_budget_tracker.budget_tracker_id))
          .where(eq(user_budget_tracker.user_id, userId))

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
          status: 400,
          message: "Missing required fields",
        })
      }

      const budgetTrackerId = randomUUID()

      await db.insert(budget_tracker)
        .values({
          id: budgetTrackerId,
          name,
        })

      await db.insert(user_budget_tracker)
        .values({
          user_id: userId,
          budget_tracker_id: budgetTrackerId,
          role: "owner",
        })

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
        id,
        name,
      }: {
        id?: string;
        name?: string;
      } = await readBody(event)

      if (!id || !name) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const userAccess = await db.select({ role: user_budget_tracker.role })
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, id),
        ))
        .limit(1)

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditTracker(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to edit this budget tracker",
        })
      }

      await db.update(budget_tracker)
        .set({ name })
        .where(eq(budget_tracker.id, id))

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
          status: 400,
          message: "Missing required fields",
        })
      }

      const userAccess = await db.select({ role: user_budget_tracker.role })
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, id),
        ))
        .limit(1)

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canDeleteTracker(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "Only the owner can delete this budget tracker",
        })
      }

      await db.delete(budget_tracker)
        .where(eq(budget_tracker.id, id))

      return {
        status: 200,
        body: {
          success: "Budget tracker deleted",
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
