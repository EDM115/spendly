export type BudgetTrackerRole = "owner" | "admin" | "editor" | "viewer"

export type UserType = "admin" | "user"

export type DemoUserEnv = {
  username: string;
  password: string;
}

export type SharedUser = {
  user_id: string;
  username: string;
  role: BudgetTrackerRole;
}

export type BudgetTracker = {
  id: string;
  name: string;
  role: BudgetTrackerRole;
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
  is_spending: boolean;
  category_id: string;
  date: string;
  category_name: string;
  icon_color: string;
  icon: string;
}

export type ErrorType
  = | {
    data?: {
      message: string;
      statusText: string;
    };
  }
  | string

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

export type UiEventOutcome = "success" | "error" | "canceled"

export type UiEventPayload = {
  client_event_id: string;
  ts: string;
  action: string;
  route: string;
  store?: string;
  duration_ms?: number;
  outcome?: UiEventOutcome;
  meta?: Record<string, unknown>;
}

export type AdminUserRequest = {
  id: string;
  type: "export" | "delete";
  request_date: string | Date;
  user_id: string;
  user_name: string;
  user_email: string;
  user_username: string | null;
  user_display_username: string | null;
}
