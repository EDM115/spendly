export type BudgetTrackerRole = "owner" | "admin" | "editor" | "viewer" | null

export type DemoUserEnv = {
  username: string;
  password: string;
}

export type User = {
  id: string;
  username: string;
  role: Exclude<BudgetTrackerRole, null>;
}

export type SeedUser = Omit<User, "id"> & {
  password: string;
}

export type BudgetTracker = {
  id: string;
  name: string;
  role: Exclude<BudgetTrackerRole, null>;
}

export type SharedUser = {
  user_id: string;
  username: string;
  role: Exclude<BudgetTrackerRole, null>;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget_tracker_id: string;
}

export type Spending = {
  id: string;
  name: string;
  budget_tracker_id: string;
  value: number;
  is_spending: number;
  category_id: string;
  date: string;
  category_name: string;
  icon_color: string;
  icon: string;
}

export type ErrorType = {
  data?: {
    message: string;
    statusText: string;
  };
} | string

export type StoreUser = {
  id: string;
  username: string;
  token: string;
  role: Exclude<BudgetTrackerRole, null>;
} | null


export type Language = "en" | "fr"

export type Theme = "light" | "dark"

export type ExportFormat = "csv" | "json" | "sql" | "sqlite"

export type MdiMetaItem = {
  id: string;
  name: string;
  codepoint: string;
  aliases: string[];
  tags: string[];
  styles: string[];
  author: string;
  version: string;
  deprecated: boolean;
}
