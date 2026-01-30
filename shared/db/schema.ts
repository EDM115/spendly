import {
  index,
  int,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"

export const User = sqliteTable(
  "User",
  {
    id: text()
      .primaryKey(),
    username: text()
      .notNull()
      .unique(),
    password: text()
      .notNull(),
    role: text({ enum: ["admin", "user"] })
      .notNull()
      .default("user"),
  },
)

export const BudgetTracker = sqliteTable(
  "BudgetTracker",
  {
    id: text()
      .primaryKey(),
    name: text()
      .notNull(),
  },
)

export const UserBudgetTracker = sqliteTable(
  "UserBudgetTracker",
  {
    user_id: text()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    budget_tracker_id: text()
      .notNull()
      .references(() => BudgetTracker.id, { onDelete: "cascade" }),
    role: text({ enum: ["viewer", "editor", "admin", "owner"] })
      .notNull()
      .default("viewer"),
  },
  (table) => [
    primaryKey({ columns: [ table.user_id, table.budget_tracker_id ] }),
    index("ubt_budget_tracker_id_idx")
      .on(table.budget_tracker_id),
  ],
)

export const Category = sqliteTable(
  "Category",
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
      .references(() => BudgetTracker.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("category_budget_tracker_id_idx")
      .on(table.budget_tracker_id),
  ],
)

export const Spending = sqliteTable(
  "Spending",
  {
    id: text()
      .primaryKey(),
    name: text()
      .notNull(),
    budget_tracker_id: text()
      .notNull()
      .references(() => BudgetTracker.id, { onDelete: "cascade" }),
    value: real()
      .notNull(),
    is_spending: int({ mode: "boolean" })
      .notNull()
      .default(true),
    category_id: text()
      .notNull()
      .references(() => Category.id, { onDelete: "cascade" }),
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
