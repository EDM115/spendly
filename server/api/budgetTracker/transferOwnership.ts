import { db } from "#shared/db/drizzle"
import { user_budget_tracker } from "#shared/db/schema"

import {
  and,
  eq,
} from "drizzle-orm"
import { requireUserId } from "#server/utils/session"

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      status: 405,
      message: "Method not allowed",
    })
  }

  if (event.context.auth?.username === "demo") {
    throw createError({
      status: 403,
      message: "Demo users cannot manage budget tracker users",
    })
  }

  const userId = requireUserId(event.context.auth)
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

  if (target_user_id === userId) {
    throw createError({
      status: 400,
      message: "Cannot transfer ownership to yourself",
    })
  }

  const ownerAccess = await db.select({ role: user_budget_tracker.role })
    .from(user_budget_tracker)
    .where(and(
      eq(user_budget_tracker.user_id, userId),
      eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
    ))
    .limit(1)

  if (ownerAccess.length === 0) {
    throw createError({
      status: 403,
      message: "Access denied",
    })
  }

  if (ownerAccess[0]!.role !== "owner") {
    throw createError({
      status: 403,
      message: "Only the owner can transfer ownership",
    })
  }

  const targetAccess = await db.select({ role: user_budget_tracker.role })
    .from(user_budget_tracker)
    .where(and(
      eq(user_budget_tracker.user_id, target_user_id),
      eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
    ))
    .limit(1)

  if (targetAccess.length === 0) {
    throw createError({
      status: 404,
      message: "Target user not found in this budget tracker",
    })
  }

  db.transaction((tx) => {
    tx.update(user_budget_tracker)
      .set({ role: "admin" })
      .where(and(
        eq(user_budget_tracker.user_id, userId),
        eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
      ))

    tx.update(user_budget_tracker)
      .set({ role: "owner" })
      .where(and(
        eq(user_budget_tracker.user_id, target_user_id),
        eq(user_budget_tracker.budget_tracker_id, budget_tracker_id),
      ))
  })

  return {
    status: 200,
    body: {
      success: "Ownership transferred",
    },
  }
})
