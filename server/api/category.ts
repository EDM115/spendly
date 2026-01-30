import db from "#shared/db/drizzle"
import {
  Category,
  UserBudgetTracker,
} from "#shared/db/schema"

import {
  and,
  eq,
} from "drizzle-orm"
import { randomUUID } from "node:crypto"

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

  const userId: string | undefined = event.context.auth?.userId

  if (!userId) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    })
  }

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
        const category = await db.select()
          .from(Category)
          .where(eq(Category.id, category_id))
          .limit(1)

        if (category.length === 0) {
          throw createError({
            status: 404,
            message: "Category not found",
          })
        }

        const hasAccess = await db.select()
          .from(UserBudgetTracker)
          .where(and(
            eq(UserBudgetTracker.user_id, userId),
            eq(UserBudgetTracker.budget_tracker_id, category[0]!.budget_tracker_id),
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
            category: category[0]!,
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
          .from(UserBudgetTracker)
          .where(and(
            eq(UserBudgetTracker.user_id, userId),
            eq(UserBudgetTracker.budget_tracker_id, budget_tracker_id),
          ))
          .limit(1)

        if (hasAccess.length === 0) {
          throw createError({
            status: 403,
            message: "Access denied",
          })
        }

        const categories = await db.select()
          .from(Category)
          .where(eq(Category.budget_tracker_id, budget_tracker_id))

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
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage categories",
        })
      }

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

      if (!canEditCategory(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to add categories",
        })
      }

      const categoryId = randomUUID()

      await db.insert(Category)
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
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage categories",
        })
      }

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

      const category = await db.select({ budget_tracker_id: Category.budget_tracker_id })
        .from(Category)
        .where(eq(Category.id, id))
        .limit(1)

      if (category.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, category[0]!.budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to edit categories",
        })
      }

      await db.update(Category)
        .set({
          name,
          icon,
          color,
        })
        .where(eq(Category.id, id))

      return {
        status: 200,
        body: {
          success: "Category updated",
        },
      }
    }
    case "DELETE": {
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage categories",
        })
      }

      const { id }: { id?: string } = await readBody(event)

      if (!id) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const category = await db.select({ budget_tracker_id: Category.budget_tracker_id })
        .from(Category)
        .where(eq(Category.id, id))
        .limit(1)

      if (category.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      const userAccess = await db.select()
        .from(UserBudgetTracker)
        .where(and(
          eq(UserBudgetTracker.user_id, userId),
          eq(UserBudgetTracker.budget_tracker_id, category[0]!.budget_tracker_id),
        ))

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditCategory(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to delete categories",
        })
      }

      await db.delete(Category)
        .where(eq(Category.id, id))

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
