import { db } from "#shared/db/drizzle"
import {
  budget_tracker,
  user,
  user_budget_tracker,
} from "#shared/db/schema"
import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"

import {
  and,
  eq,
  inArray,
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

        const owner = await db.select({
          owner_name: user.name,
        })
          .from(user_budget_tracker)
          .innerJoin(user, eq(user_budget_tracker.user_id, user.id))
          .where(and(
            eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
            eq(user_budget_tracker.role, "owner"),
          ))
          .limit(1)

        if (budgetTracker.length === 0) {
          throw createError({
            status: 404,
            message: "Budget tracker not found or access denied",
          })
        }

        addWide(event, {
          op: {
            name: "budgetTracker.read",
            entity: "budget_tracker",
            entity_id: budget_tracker_id,
          },
        })

        return {
          status: 200,
          body: {
            success: "Budget tracker retrieved",
            budgetTracker: {
              ...budgetTracker[0]!,
              owner_name: owner[0]?.owner_name ?? null,
            },
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

        const trackerIds = budgetTrackers.map((tracker) => tracker.id)

        const owners = trackerIds.length > 0
          ? await db.select({
              budget_tracker_id: user_budget_tracker.budget_tracker_id,
              owner_name: user.name,
            })
              .from(user_budget_tracker)
              .innerJoin(user, eq(user_budget_tracker.user_id, user.id))
              .where(and(
                eq(user_budget_tracker.role, "owner"),
                inArray(user_budget_tracker.budget_tracker_id, trackerIds),
              ))
          : []

        const ownerByTrackerId = new Map(owners.map((entry) => [
          entry.budget_tracker_id,
          entry.owner_name,
        ]))

        const budgetTrackersWithOwner = budgetTrackers.map((tracker) => ({
          ...tracker,
          owner_name: ownerByTrackerId.get(tracker.id) ?? null,
        }))

        addWide(event, {
          op: {
            name: "budgetTracker.list",
            entity: "budget_tracker",
            count: budgetTrackers.length,
          },
        })

        return {
          status: 200,
          body: {
            success: "Budget trackers retrieved",
            budgetTrackers: budgetTrackersWithOwner,
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

      addWide(event, {
        op: {
          name: "budgetTracker.create",
          entity: "budget_tracker",
          entity_id: budgetTrackerId,
        },
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

      addWide(event, {
        op: {
          name: "budgetTracker.update",
          entity: "budget_tracker",
          entity_id: id,
        },
      })

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

      addWide(event, {
        op: {
          name: "budgetTracker.delete",
          entity: "budget_tracker",
          entity_id: id,
        },
      })

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
