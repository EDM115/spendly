import JSZip from "jszip"

import { db } from "#shared/db/drizzle"
import {
  account,
  budget_tracker,
  category,
  spending,
  user,
  user_budget_tracker,
} from "#shared/db/schema"
import { auth } from "#server/utils/auth"

import type { H3Event } from "h3"

import {
  and,
  eq,
} from "drizzle-orm"

type UserExportResult = {
  body: string;
  filename: string;
  userRecord: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
    lastLoginMethod: string | null;
    username: string | null;
    displayUsername: string | null;
  };
  oauthEmails: string[];
}

const buildHeaders = (event: H3Event): Headers => {
  const headers = new Headers()
  const requestHeaders = getRequestHeaders(event)

  for (const [ key, value ] of Object.entries(requestHeaders)) {
    if (typeof value === "string") {
      headers.set(key, value)
    }
  }

  return headers
}

const safeFolderName = (value: string, fallback: string): string => {
  const normalized = value
    .trim()
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "-")
    .replace(/_+/g, "_")
    .replace(/-+/g, "-")
    .slice(0, 80)

  return normalized.length > 0
    ? normalized
    : fallback
}

const ensureUniqueFolder = (name: string, existing: Set<string>): string => {
  if (!existing.has(name)) {
    existing.add(name)

    return name
  }

  let idx = 2
  let candidate = `${name}-${idx}`

  while (existing.has(candidate)) {
    idx += 1
    candidate = `${name}-${idx}`
  }

  existing.add(candidate)

  return candidate
}

const escapeCsvValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return ""
  }

  const str = String(value)

  return `"${str.replace(/"/g, "\"\"")}"`
}

export async function buildUserExport(event: H3Event, targetUserId: string): Promise<UserExportResult> {
  const targetUser = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
    banned: user.banned,
    banReason: user.banReason,
    banExpires: user.banExpires,
    lastLoginMethod: user.lastLoginMethod,
    username: user.username,
    displayUsername: user.displayUsername,
  })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1)

  if (targetUser.length === 0) {
    throw createError({
      status: 404,
      message: "User not found",
    })
  }

  const userRecord = targetUser[0]!
  const userAccounts = await db.select()
    .from(account)
    .where(eq(account.userId, targetUserId))

  const headers = buildHeaders(event)
  const accountInfos = await Promise.all(userAccounts.map(async (accountRow) => {
    try {
      const info = await auth.api.accountInfo({
        query: {
          accountId: accountRow.accountId,
        },
        headers,
      })

      return {
        accountId: accountRow.accountId,
        providerId: accountRow.providerId,
        info: info ?? null,
      }
    } catch (_error) {
      return {
        accountId: accountRow.accountId,
        providerId: accountRow.providerId,
        info: null,
      }
    }
  }))

  const accountsExport = userAccounts.map((accountRow) => Object.assign(accountRow, {
    oauthInfo:
        accountInfos.find((info) => info.accountId === accountRow.accountId)?.info
        ?? null,
  }))

  const oauthEmailSet = new Set<string>()

  for (const accountInfo of accountInfos) {
    const email = accountInfo.info?.user?.email

    if (!email) {
      continue
    }

    if (email !== userRecord.email) {
      oauthEmailSet.add(email)
    }
  }

  const trackers = await db.select({
    id: budget_tracker.id,
    name: budget_tracker.name,
    role: user_budget_tracker.role,
  })
    .from(user_budget_tracker)
    .innerJoin(budget_tracker, eq(user_budget_tracker.budget_tracker_id, budget_tracker.id))
    .where(eq(user_budget_tracker.user_id, targetUserId))

  const zip = new JSZip()
  const userFolder = zip.folder("user")
  const dataFolder = zip.folder("data")

  userFolder?.file("user.json", JSON.stringify(userRecord, null, 2))
  userFolder?.file("accounts.json", JSON.stringify(accountsExport, null, 2))

  const usedFolders = new Set<string>()

  const exportsByTracker = await Promise.all(trackers.map(async (tracker) => {
    const [ categories, spendings ] = await Promise.all([
      db
        .select({
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget_tracker_id: category.budget_tracker_id,
        })
        .from(category)
        .where(eq(category.budget_tracker_id, tracker.id)),

      db
        .select({
          id: spending.id,
          name: spending.name,
          budget_tracker_id: spending.budget_tracker_id,
          value: spending.value,
          is_spending: spending.is_spending,
          category_id: spending.category_id,
          date: spending.date,
          category_name: category.name,
          category_color: category.color,
          category_icon: category.icon,
        })
        .from(spending)
        .innerJoin(category, eq(spending.category_id, category.id))
        .where(and(
          eq(spending.budget_tracker_id, tracker.id),
          eq(category.budget_tracker_id, tracker.id),
        )),
    ])

    const spendingsExport = spendings.map((entry) => ({
      id: entry.id,
      name: entry.name,
      amount: entry.value,
      type: entry.is_spending
        ? "expense"
        : "income",
      category: entry.category_name,
      category_color: entry.category_color,
      category_icon: entry.category_icon,
      date: entry.date,
    }))

    const csvHeaders = [
      "Name",
      "Amount",
      "Type",
      "Category",
      "CategoryColor",
      "CategoryIcon",
      "Date",
    ]

    const csvRows = spendingsExport.map((entry) => [
      escapeCsvValue(entry.name),
      entry.amount,
      entry.type,
      escapeCsvValue(entry.category),
      escapeCsvValue(entry.category_color),
      escapeCsvValue(entry.category_icon),
      entry.date,
    ].join(","))

    const csvContent = [ csvHeaders.join(","), ...csvRows ].join("\n")

    return {
      tracker, categories, spendingsExport, csvContent,
    }
  }))

  for (const {
    tracker, categories, spendingsExport, csvContent,
  } of exportsByTracker) {
    const baseFolderName = safeFolderName(tracker.name, tracker.id)
    const folderName = ensureUniqueFolder(baseFolderName, usedFolders)
    const trackerFolder = dataFolder?.folder(folderName)

    trackerFolder?.file(
      "tracker.json",
      JSON.stringify({
        id: tracker.id, name: tracker.name, role: tracker.role,
      }, null, 2),
    )
    trackerFolder?.file("categories.json", JSON.stringify(categories, null, 2))
    trackerFolder?.file("spendings.json", JSON.stringify(spendingsExport, null, 2))
    trackerFolder?.file("spendings.csv", csvContent)
  }

  const dateYMD = new Date()
    .toISOString()
    .split("T")[0]
  const userLabel = safeFolderName(
    userRecord.displayUsername ?? userRecord.username ?? userRecord.name ?? userRecord.id,
    userRecord.id,
  )
  const archive = await zip.generateAsync({ type: "nodebuffer" })

  return {
    body: archive.toString("base64"),
    filename: `spendly-user-export-${userLabel}-${dateYMD}.zip`,
    userRecord,
    oauthEmails: [...oauthEmailSet],
  }
}
