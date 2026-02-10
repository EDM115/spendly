import {
  relations,
  sql,
} from "drizzle-orm"
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"

// #region Better Auth
export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey(),
  name: text("name")
    .notNull(),
  email: text("email")
    .notNull()
    .unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" })
    .default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
  lastLoginMethod: text("last_login_method"),
  username: text("username")
    .unique(),
  displayUsername: text("display_username"),
})

export const session = sqliteTable(
  "session",
  {
    id: text("id")
      .primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" })
      .notNull(),
    token: text("token")
      .notNull()
      .unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [
    index("session_userId_idx")
      .on(table.userId),
  ],
)

export const account = sqliteTable(
  "account",
  {
    id: text("id")
      .primaryKey(),
    accountId: text("account_id")
      .notNull(),
    providerId: text("provider_id")
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx")
      .on(table.userId),
  ],
)

export const verification = sqliteTable(
  "verification",
  {
    id: text("id")
      .primaryKey(),
    identifier: text("identifier")
      .notNull(),
    value: text("value")
      .notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" })
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx")
      .on(table.identifier),
  ],
)
// #endregion

// #region Spendly
export const user_requests = sqliteTable(
  "user_requests",
  {
    id: text("id")
      .primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", { "enum": [ "export", "delete" ] })
      .notNull(),
    request_date: integer("request_date", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
)

export const budget_tracker = sqliteTable(
  "budget_tracker",
  {
    id: text()
      .primaryKey(),
    name: text()
      .notNull(),
  },
)

export const user_budget_tracker = sqliteTable(
  "user_budget_tracker",
  {
    user_id: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    budget_tracker_id: text()
      .notNull()
      .references(() => budget_tracker.id, { onDelete: "cascade" }),
    role: text({ "enum": [ "viewer", "editor", "admin", "owner" ] })
      .notNull()
      .default("viewer"),
  },
  (table) => [
    primaryKey({ columns: [ table.user_id, table.budget_tracker_id ] }),
    index("ubt_budget_tracker_id_idx")
      .on(table.budget_tracker_id),
  ],
)

export const category = sqliteTable(
  "category",
  {
    id: text()
      .primaryKey(),
    name: text()
      .notNull(),
    icon: text()
      .notNull(),
    color: text()
      .notNull(),
    budget_tracker_id: text()
      .notNull()
      .references(() => budget_tracker.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("category_budget_tracker_id_idx")
      .on(table.budget_tracker_id),
  ],
)

export const spending = sqliteTable(
  "spending",
  {
    id: text()
      .primaryKey(),
    name: text()
      .notNull(),
    budget_tracker_id: text()
      .notNull()
      .references(() => budget_tracker.id, { onDelete: "cascade" }),
    value: real()
      .notNull(),
    is_spending: integer({ mode: "boolean" })
      .notNull()
      .default(true),
    category_id: text()
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    date: text()
      .notNull(),
  },
  (table) => [
    index("spending_tracker_date_idx")
      .on(table.budget_tracker_id, table.date),
    index("spending_category_id_idx")
      .on(table.category_id),
  ],
)
// #endregion

export const schema = {
  user,
  session,
  account,
  verification,
  user_requests,
  budget_tracker,
  user_budget_tracker,
  category,
  spending,
} as const

// #region Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  userRequests: many(user_requests),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
// #endregion

export default schema
