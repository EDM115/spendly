import { db } from "#shared/db/drizzle"
import {
  category,
  spending,
  user_budget_tracker,
} from "#shared/db/schema"
import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"

import {
  and,
  desc,
  eq,
  gte,
  lt,
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

  const userId = requireUserId(event.context.auth)

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

      const userAccess = await db.select({ role: user_budget_tracker.role })
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (spending_id) {
        const dbSpending = await db.select({
          id: spending.id,
          name: spending.name,
          budget_tracker_id: spending.budget_tracker_id,
          value: spending.value,
          is_spending: spending.is_spending,
          category_id: spending.category_id,
          date: spending.date,
          category_name: category.name,
          icon_color: category.color,
          icon: category.icon,
        })
          .from(spending)
          .innerJoin(category, eq(spending.category_id, category.id))
          .where(and(
            eq(spending.id, spending_id),
            eq(spending.budget_tracker_id, budget_tracker_id),
          ))
          .limit(1)

        if (dbSpending.length === 0) {
          throw createError({
            status: 404,
            message: "Spending not found",
          })
        }

        addWide(event, {
          op: {
            name: "spending.read",
            entity: "spending",
            entity_id: spending_id,
          },
        })

        return {
          status: 200,
          body: {
            success: "Spending retrieved",
            spending: dbSpending[0]!,
          },
        }
      } else {
        const spendings = await db.select({
          id: spending.id,
          name: spending.name,
          budget_tracker_id: spending.budget_tracker_id,
          value: spending.value,
          is_spending: spending.is_spending,
          category_id: spending.category_id,
          date: spending.date,
          category_name: category.name,
          icon_color: category.color,
          icon: category.icon,
        })
          .from(spending)
          .innerJoin(category, eq(spending.category_id, category.id))
          .where(and(
            eq(spending.budget_tracker_id, budget_tracker_id),
            start_date
              ? gte(spending.date, start_date)
              : undefined,
            end_date
              ? lt(spending.date, end_date)
              : undefined,
          ))
          .orderBy(desc(spending.date))

        addWide(event, {
          op: {
            name: "spending.list",
            entity: "spending",
            count: spendings.length,
          },
        })

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

      const userAccess = await db.select({ role: user_budget_tracker.role })
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditSpending(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to add transactions",
        })
      }

      const categoryExists = await db.select()
        .from(category)
        .where(and(
          eq(category.id, category_id),
          eq(category.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (categoryExists.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      const spendingId = randomUUID()

      await db.insert(spending)
        .values({
          id: spendingId,
          name,
          budget_tracker_id,
          value,
          is_spending,
          category_id,
          date,
        })

      addWide(event, {
        op: {
          name: "spending.create",
          entity: "spending",
          entity_id: spendingId,
        },
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

      const userAccess = await db.select({ role: user_budget_tracker.role })
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditSpending(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to edit transactions",
        })
      }

      const spendingExists = await db.select()
        .from(spending)
        .where(and(
          eq(spending.id, id),
          eq(spending.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (spendingExists.length === 0) {
        throw createError({
          status: 404,
          message: "Spending not found",
        })
      }

      const categoryExists = await db.select()
        .from(category)
        .where(and(
          eq(category.id, category_id),
          eq(category.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (categoryExists.length === 0) {
        throw createError({
          status: 404,
          message: "Category not found",
        })
      }

      await db.update(spending)
        .set({
          name,
          value,
          is_spending,
          category_id,
          date,
        })
        .where(and(
          eq(spending.id, id),
          eq(spending.budget_tracker_id, budget_tracker_id),
        ))

      addWide(event, {
        op: {
          name: "spending.update",
          entity: "spending",
          entity_id: id,
        },
      })

      return {
        status: 200,
        body: {
          success: "Spending updated",
        },
      }
    }
    case "DELETE": {
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

      const userAccess = await db.select({ role: user_budget_tracker.role })
        .from(user_budget_tracker)
        .where(and(
          eq(user_budget_tracker.user_id, userId),
          eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (userAccess.length === 0) {
        throw createError({
          status: 403,
          message: "Access denied",
        })
      }

      if (!canEditSpending(userAccess[0]!.role)) {
        throw createError({
          status: 403,
          message: "You do not have permission to delete transactions",
        })
      }

      const spendingExists = await db.select()
        .from(spending)
        .where(and(
          eq(spending.id, id),
          eq(spending.budget_tracker_id, budget_tracker_id),
        ))
        .limit(1)

      if (spendingExists.length === 0) {
        throw createError({
          status: 404,
          message: "Spending not found",
        })
      }

      await db.delete(spending)
        .where(and(
          eq(spending.id, id),
          eq(spending.budget_tracker_id, budget_tracker_id),
        ))

      addWide(event, {
        op: {
          name: "spending.delete",
          entity: "spending",
          entity_id: id,
        },
      })

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
