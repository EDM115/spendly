import db from "#shared/db/drizzle"
import {
  BudgetTracker,
  UserBudgetTracker,
} from "#shared/db/schema"

import {
  and,
  eq,
} from "drizzle-orm"
import { randomUUID } from "node:crypto"

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

      if (budget_tracker_id) {
        const budgetTracker = await db.select({
          id: BudgetTracker.id,
          name: BudgetTracker.name,
          role: UserBudgetTracker.role,
        })
          .from(BudgetTracker)
          .innerJoin(UserBudgetTracker, eq(BudgetTracker.id, UserBudgetTracker.budget_tracker_id))
          .where(and(
            eq(BudgetTracker.id, budget_tracker_id),
            eq(UserBudgetTracker.user_id, userId),
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
          id: BudgetTracker.id,
          name: BudgetTracker.name,
          role: UserBudgetTracker.role,
        })
          .from(BudgetTracker)
          .innerJoin(UserBudgetTracker, eq(BudgetTracker.id, UserBudgetTracker.budget_tracker_id))
          .where(eq(UserBudgetTracker.user_id, userId))

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
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot create budget trackers",
        })
      }

      const { name }: { name?: string } = await readBody(event)

      if (!name) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const budgetTrackerId = randomUUID()

      await db.insert(BudgetTracker)
        .values({
          id: budgetTrackerId,
          name,
        })

      await db.insert(UserBudgetTracker)
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
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot edit budget trackers",
        })
      }

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

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditTracker(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to edit this budget tracker",
        })
      }

      await db.update(BudgetTracker)
        .set({ name })
        .where(eq(BudgetTracker.id, id))

      return {
        status: 200,
        body: {
          success: "Budget tracker updated",
        },
      }
    }
    case "DELETE": {
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot delete budget trackers",
        })
      }

      const { id }: { id?: string } = await readBody(event)

      if (!id) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canDeleteTracker(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "Only the owner can delete this budget tracker",
        })
      }

      await db.delete(BudgetTracker)
        .where(eq(BudgetTracker.id, id))

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
