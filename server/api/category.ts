import { db } from "#shared/db/drizzle"
import {
  category,
  user_budget_tracker,
} from "#shared/db/schema"

import {
  and,
  eq,
} from "drizzle-orm"
import { randomUUID } from "node:crypto"
import { requireUserId } from "#server/utils/session"

function canEditCategory(role: BudgetTrackerRole): boolean {
  return [ "owner", "admin", "editor" ].includes(role)
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
      const {
        category_id,
        budget_tracker_id,
      }: {
        category_id?: string;
        budget_tracker_id?: string;
      } = getQuery(event)

      if (category_id) {
        const dbCategory = await db.select()
          .from(category)
          .where(eq(category.id, category_id))
          .limit(1)

        if (dbCategory.length === 0) {
          throw createError({
            status: 404,
            message: "Category not found",
          })
        }

        const hasAccess = await db.select()
          .from(user_budget_tracker)
          .where(and(
            eq(user_budget_tracker.user_id, userId),
            eq(user_budget_tracker.budget_tracker_id, dbCategory[0]!.budget_tracker_id),
          ))
          .limit(1)

        if (hasAccess.length === 0) {
          throw createError({
            status: 403,
            message: "Access denied",
          })
        }

        return {
          status: 200,
          body: {
            success: "Category retrieved",
            category: dbCategory[0]!,
          },
        }
      } else {
        if (!budget_tracker_id) {
          throw createError({
            status: 400,
            message: "Missing budget_tracker_id",
          })
        }

        const hasAccess = await db.select()
          .from(user_budget_tracker)
          .where(and(
            eq(user_budget_tracker.user_id, userId),
            eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
          ))
          .limit(1)

        if (hasAccess.length === 0) {
          throw createError({
            status: 403,
            message: "Access denied",
          })
        }

        const categories = await db.select()
          .from(category)
          .where(eq(category.budget_tracker_id, budget_tracker_id))

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
        name,
        icon,
        color,
        budget_tracker_id,
      }: {
        name?: string;
        icon?: string;
        color?: string;
        budget_tracker_id?: string;
      } = await readBody(event)

      if (!name || !icon || !color || !budget_tracker_id) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const userAccess = await db.select()
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to add categories",
        })
      }

      const categoryId = randomUUID()

      await db.insert(category)
        .values({
          id: categoryId,
          name,
          icon,
          color,
          budget_tracker_id,
        })

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
        id,
        name,
        icon,
        color,
      }: {
        id?: string;
        name?: string;
        icon?: string;
        color?: string;
      } = await readBody(event)

      if (!id || !name || !icon || !color) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const dbCategory = await db.select({ budget_tracker_id: category.budget_tracker_id })
        .from(category)
        .where(eq(category.id, id))
        .limit(1)

      if (dbCategory.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      const userAccess = await db.select()
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, dbCategory[0]!.budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to edit categories",
        })
      }

      await db.update(category)
        .set({
          name,
          icon,
          color,
        })
        .where(eq(category.id, id))

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
          status: 400,
          message: "Missing required fields",
        })
      }

      const dbCategory = await db.select({ budget_tracker_id: category.budget_tracker_id })
        .from(category)
        .where(eq(category.id, id))
        .limit(1)

      if (dbCategory.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      const userAccess = await db.select()
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, dbCategory[0]!.budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to delete categories",
        })
      }

      await db.delete(category)
        .where(eq(category.id, id))

      return {
        status: 200,
        body: {
          success: "Category deleted",
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
