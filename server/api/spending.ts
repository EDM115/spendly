import db from "#shared/db/drizzle"
import {
  Category,
  Spending,
  UserBudgetTracker,
} from "#shared/db/schema"

import {
  and,
  desc,
  eq,
  gte,
  lte,
} from "drizzle-orm"
import { randomUUID } from "node:crypto"

function canEditSpending(role: BudgetTrackerRole): boolean {
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
        budget_tracker_id,
        spending_id,
        start_date,
        end_date,
      }: {
        budget_tracker_id?: string;
        spending_id?: string;
        start_date?: string;
        end_date?: string;
      } = getQuery(event)

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

      if (spending_id) {
        const spending = await db.select({
          id: Spending.id,
          name: Spending.name,
          budget_tracker_id: Spending.budget_tracker_id,
          value: Spending.value,
          is_spending: Spending.is_spending,
          category_id: Spending.category_id,
          date: Spending.date,
          category_name: Category.name,
          icon_color: Category.color,
          icon: Category.icon,
        })
          .from(Spending)
          .innerJoin(Category, eq(Spending.category_id, Category.id))
          .where(and(
            eq(Spending.id, spending_id),
            eq(Spending.budget_tracker_id, budget_tracker_id),
          ))
          .limit(1)

        if (spending.length === 0) {
          throw createError({
            status: 404,
            message: "Spending not found",
          })
        }

        return {
          status: 200,
          body: {
            success: "Spending retrieved",
            spending: spending[0]!,
          },
        }
      } else {
        const spendings = await db.select({
          id: Spending.id,
          name: Spending.name,
          budget_tracker_id: Spending.budget_tracker_id,
          value: Spending.value,
          is_spending: Spending.is_spending,
          category_id: Spending.category_id,
          date: Spending.date,
          category_name: Category.name,
          icon_color: Category.color,
          icon: Category.icon,
        })
          .from(Spending)
          .innerJoin(Category, eq(Spending.category_id, Category.id))
          .where(and(
            eq(Spending.budget_tracker_id, budget_tracker_id),
            start_date
              ? gte(Spending.date, start_date)
              : undefined,
            end_date
              ? lte(Spending.date, end_date)
              : undefined,
          ))
          .orderBy(desc(Spending.date))

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
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage transactions",
        })
      }

      const {
        name,
        budget_tracker_id,
        value,
        is_spending,
        category_id,
        date,
      }: {
        name?: string;
        budget_tracker_id?: string;
        value?: number;
        is_spending?: boolean;
        category_id?: string;
        date?: string;
      } = await readBody(event)

      if (
        !name
        || !budget_tracker_id
        || value === undefined
        || is_spending === undefined
        || !category_id
        || !date
      ) {
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

      if (!canEditSpending(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to add transactions",
        })
      }

      const categoryExists = await db.select()
        .from(Category)
        .where(and(
          eq(Category.id, category_id),
          eq(Category.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (categoryExists.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      const spendingId = randomUUID()

      await db.insert(Spending)
        .values({
          id: spendingId,
          name,
          budget_tracker_id,
          value,
          is_spending,
          category_id,
          date,
        })

      return {
        status: 201,
        body: {
          success: "Spending created",
          id: spendingId,
        },
      }
    }
    case "PUT": {
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage transactions",
        })
      }

      const {
        id,
        name,
        value,
        is_spending,
        category_id,
        date,
        budget_tracker_id,
      }: {
        id?: string;
        name?: string;
        value?: number;
        is_spending?: boolean;
        category_id?: string;
        date?: string;
        budget_tracker_id?: string;
      } = await readBody(event)

      if (
        !id
        || !name
        || value === undefined
        || is_spending === undefined
        || !category_id
        || !date
        || !budget_tracker_id
      ) {
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

      if (!canEditSpending(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to edit transactions",
        })
      }

      const spendingExists = await db.select()
        .from(Spending)
        .where(and(
          eq(Spending.id, id),
          eq(Spending.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (spendingExists.length === 0) {
        throw createError({
          status: 404,
          message: "Spending not found",
        })
      }

      const categoryExists = await db.select()
        .from(Category)
        .where(and(
          eq(Category.id, category_id),
          eq(Category.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (categoryExists.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      await db.update(Spending)
        .set({
          name,
          value,
          is_spending,
          category_id,
          date,
        })
        .where(and(
          eq(Spending.id, id),
          eq(Spending.budget_tracker_id, budget_tracker_id),
        ))

      return {
        status: 200,
        body: {
          success: "Spending updated",
        },
      }
    }
    case "DELETE": {
      if (event.context.auth?.username === "demo") {
        throw createError({
          status: 403,
          message: "Demo users cannot manage transactions",
        })
      }

      const {
        id,
        budget_tracker_id,
      }: {
        id?: string;
        budget_tracker_id?: string;
      } = await readBody(event)

      if (!id || !budget_tracker_id) {
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

      if (!canEditSpending(userAccess[0]!.role )) {
        throw createError({
          status: 403,
          message: "You do not have permission to delete transactions",
        })
      }

      const spendingExists = await db.select()
        .from(Spending)
        .where(and(
          eq(Spending.id, id),
          eq(Spending.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (spendingExists.length === 0) {
        throw createError({
          status: 404,
          message: "Spending not found",
        })
      }

      await db.delete(Spending)
        .where(and(
          eq(Spending.id, id),
          eq(Spending.budget_tracker_id, budget_tracker_id),
        ))

      return {
        status: 200,
        body: {
          success: "Spending deleted",
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
